package il.tzarim.watch.domain

enum class ContractionSource { PHONE, WATCH }

data class Contraction(
    val id: String,
    val startedAt: Long,
    val endedAt: Long? = null,
    val intensity: Int? = null,
    val source: ContractionSource = ContractionSource.WATCH,
    val updatedAt: Long = startedAt,
)

data class Session(
    val id: String,
    val startedAt: Long,
    val endedAt: Long? = null,
    val contractions: List<Contraction> = emptyList(),
    val waterBrokeAt: Long? = null,
    val updatedAt: Long = startedAt,
)

data class SyncEvent(
    val eventId: String,
    val entityId: String,
    val deviceId: String,
    val operation: String,
    val timestamp: Long,
    val payload: String,
)
