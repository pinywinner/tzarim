package il.tzarim.watch

import android.app.Application
import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import il.tzarim.watch.data.WatchRepositoryImpl
import il.tzarim.watch.data.WearDataLayerSync
import il.tzarim.watch.domain.Contraction
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class WatchViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = WatchRepositoryImpl(application)
    private val sync = WearDataLayerSync(application)

    val items: StateFlow<List<Contraction>> =
        repository.session
            .map { it.contractions }
            .stateIn(viewModelScope, SharingStarted.Eagerly, emptyList())

    private val _intensityTarget = MutableStateFlow<String?>(null)
    val intensityTarget: StateFlow<String?> = _intensityTarget

    private val _undoTarget = MutableStateFlow<String?>(null)
    val undoTarget: StateFlow<String?> = _undoTarget

    fun start() {
        if (repository.startContraction() != null) {
            _intensityTarget.value = null
            haptic(false)
            flushSync()
        }
    }

    fun stop() {
        repository.stopContraction()?.let {
            _intensityTarget.value = it.id
            haptic(true)
            flushSync()
        }
    }

    fun cancelActive() {
        repository.cancelActiveContraction()
        _intensityTarget.value = null
        flushSync()
    }

    fun setIntensity(value: Int) {
        _intensityTarget.value?.let {
            repository.updateIntensity(it, value)
            _intensityTarget.value = null
            flushSync()
        }
    }

    fun dismissIntensity() {
        _intensityTarget.value = null
    }

    fun offerUndo() {
        items.value.lastOrNull { it.endedAt != null }?.let {
            _undoTarget.value = it.id
        }
    }

    fun undoLast() {
        _undoTarget.value?.let {
            repository.undoCompletedContraction(it)
            _undoTarget.value = null
            flushSync()
        }
    }

    fun dismissUndo() {
        _undoTarget.value = null
    }

    private fun flushSync() {
        viewModelScope.launch { runCatching { sync.flushPending() } }
    }

    private fun haptic(double: Boolean) {
        val vibrator = vibrator()
        if (double) {
            vibrator.vibrate(VibrationEffect.createWaveform(longArrayOf(0, 24, 70, 24), -1))
        } else {
            vibrator.vibrate(VibrationEffect.createOneShot(24, VibrationEffect.DEFAULT_AMPLITUDE))
        }
    }

    private fun vibrator(): Vibrator {
        val context = getApplication<Application>()
        return if (Build.VERSION.SDK_INT >= 31) {
            context.getSystemService(VibratorManager::class.java).defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        }
    }
}
