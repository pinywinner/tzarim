package il.tzarim.watch

data class Contraction(
    val id: String,
    val startedAt: Long,
    val endedAt: Long? = null,
)

fun formatClock(ms: Long): String {
    val total = (ms / 1000).coerceAtLeast(0)
    val minutes = total / 60
    val seconds = total % 60
    return "%02d:%02d".format(minutes, seconds)
}

fun activeContraction(items: List<Contraction>): Contraction? =
    items.lastOrNull { it.endedAt == null }

fun lastCompleted(items: List<Contraction>): Contraction? =
    items.lastOrNull { it.endedAt != null }

fun durationOf(item: Contraction, now: Long = System.currentTimeMillis()): Long {
    val end = item.endedAt ?: now
    return (end - item.startedAt).coerceAtLeast(0)
}

fun intervalSoFar(items: List<Contraction>, now: Long = System.currentTimeMillis()): Long? {
    val sorted = items.sortedBy { it.startedAt }
    if (sorted.isEmpty()) return null
    val last = sorted.last()
    return if (last.endedAt == null) {
        val previous = sorted.getOrNull(sorted.lastIndex - 1) ?: return null
        last.startedAt - previous.startedAt
    } else {
        now - last.startedAt
    }
}
