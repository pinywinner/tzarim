package il.tzarim.watch.data

import il.tzarim.watch.domain.Contraction
import il.tzarim.watch.domain.Session
import kotlinx.coroutines.flow.StateFlow

interface WatchRepository {
    val session: StateFlow<Session>

    fun startContraction(now: Long = System.currentTimeMillis()): Contraction?

    fun stopContraction(now: Long = System.currentTimeMillis()): Contraction?

    fun cancelActiveContraction()

    fun updateIntensity(id: String, intensity: Int?)

    fun undoCompletedContraction(id: String)
}
