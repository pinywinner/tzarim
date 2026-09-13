package il.tzarim.watch

import android.app.Application
import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.lifecycle.AndroidViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

class WatchViewModel(application: Application) : AndroidViewModel(application) {
    private val store = WatchStore(application)
    private val _items = MutableStateFlow(store.load())
    val items: StateFlow<List<Contraction>> = _items

    fun start() {
        if (activeContraction(_items.value) != null) return
        val next = _items.value + Contraction(store.newId(), System.currentTimeMillis())
        persist(next)
        haptic(double = false)
    }

    fun stop() {
        val now = System.currentTimeMillis()
        val next = _items.value.map { item ->
            if (item.endedAt == null) item.copy(endedAt = now) else item
        }
        persist(next)
        haptic(double = true)
    }

    fun cancelActive() {
        val next = _items.value.dropLastWhile { it.endedAt == null }
        persist(next)
    }

    private fun persist(next: List<Contraction>) {
        _items.value = next
        store.save(next)
    }

    private fun haptic(double: Boolean) {
        val vibrator = vibrator()
        val short = VibrationEffect.createOneShot(24, VibrationEffect.DEFAULT_AMPLITUDE)
        if (double) {
            val pattern = VibrationEffect.createWaveform(longArrayOf(0, 24, 70, 24), -1)
            vibrator.vibrate(pattern)
        } else {
            vibrator.vibrate(short)
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
