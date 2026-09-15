package il.tzarim.watch.data

import android.content.Context
import il.tzarim.watch.domain.Contraction
import il.tzarim.watch.domain.ContractionSource
import il.tzarim.watch.domain.Session
import il.tzarim.watch.domain.SyncEvent
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import java.util.UUID

class WatchRepositoryImpl(context: Context) : WatchRepository {
    private val store = WatchStore(context)
    private val deviceId = store.deviceId()
    private val _session = MutableStateFlow(store.loadSession() ?: newSession())
    override val session: StateFlow<Session> = _session

    override fun startContraction(now: Long): Contraction? {
        if (_session.value.contractions.any { it.endedAt == null }) return null
        val contraction =
            Contraction(
                id = UUID.randomUUID().toString(),
                startedAt = now,
                source = ContractionSource.WATCH,
                updatedAt = now,
            )
        update(
            _session.value.copy(
                contractions = _session.value.contractions + contraction,
                updatedAt = now,
            ),
        )
        enqueue("contraction.started", contraction.id, now, contraction.id)
        return contraction
    }

    override fun stopContraction(now: Long): Contraction? {
        val active = _session.value.contractions.lastOrNull { it.endedAt == null } ?: return null
        val stopped = active.copy(endedAt = now, updatedAt = now)
        update(
            _session.value.copy(
                contractions = _session.value.contractions.map { if (it.id == active.id) stopped else it },
                updatedAt = now,
            ),
        )
        enqueue("contraction.completed", stopped.id, now, stopped.id)
        return stopped
    }

    override fun cancelActiveContraction() {
        val active = _session.value.contractions.lastOrNull { it.endedAt == null } ?: return
        val now = System.currentTimeMillis()
        update(
            _session.value.copy(
                contractions = _session.value.contractions.filterNot { it.id == active.id },
                updatedAt = now,
            ),
        )
        enqueue("contraction.cancelled", active.id, now, active.id)
    }

    override fun updateIntensity(id: String, intensity: Int?) {
        require(intensity == null || intensity in 1..5)
        val now = System.currentTimeMillis()
        update(
            _session.value.copy(
                contractions =
                    _session.value.contractions.map {
                        if (it.id == id) it.copy(intensity = intensity, updatedAt = now) else it
                    },
                updatedAt = now,
            ),
        )
        enqueue("contraction.intensity.updated", id, now, intensity?.toString() ?: "null")
    }

    override fun undoCompletedContraction(id: String) {
        val target =
            _session.value.contractions.lastOrNull { it.id == id && it.endedAt != null } ?: return
        val now = System.currentTimeMillis()
        update(
            _session.value.copy(
                contractions = _session.value.contractions.filterNot { it.id == target.id },
                updatedAt = now,
            ),
        )
        enqueue("contraction.undone", id, now, id)
    }

    private fun update(session: Session) {
        _session.value = session
        store.saveSession(session)
    }

    private fun enqueue(operation: String, id: String, timestamp: Long, payload: String) {
        store.enqueue(
            SyncEvent(
                eventId = UUID.randomUUID().toString(),
                entityId = id,
                deviceId = deviceId,
                operation = operation,
                timestamp = timestamp,
                payload = payload,
            ),
        )
    }

    private fun newSession(): Session {
        val now = System.currentTimeMillis()
        return Session(id = UUID.randomUUID().toString(), startedAt = now, updatedAt = now)
    }
}
