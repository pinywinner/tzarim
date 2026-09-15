package il.tzarim.watch.domain

fun activeContraction(session: Session): Contraction? =
    session.contractions.lastOrNull { it.endedAt == null }

fun completedContractions(session: Session): List<Contraction> =
    session.contractions.filter { it.endedAt != null }.sortedBy { it.startedAt }

fun durationOf(contraction: Contraction, now: Long = System.currentTimeMillis()): Long {
    val end = contraction.endedAt ?: now
    return (end - contraction.startedAt).coerceAtLeast(0)
}

fun startToStartIntervals(contractions: List<Contraction>): List<Long> {
    val sorted = contractions.sortedBy { it.startedAt }
    return sorted.zipWithNext { previous, current ->
        (current.startedAt - previous.startedAt).coerceAtLeast(0)
    }
}

fun intervalSoFar(session: Session, now: Long = System.currentTimeMillis()): Long? {
    val sorted = session.contractions.sortedBy { it.startedAt }
    if (sorted.isEmpty()) return null
    val last = sorted.last()
    if (last.endedAt == null) {
        val previous = sorted.getOrNull(sorted.lastIndex - 1) ?: return null
        return (last.startedAt - previous.startedAt).coerceAtLeast(0)
    }
    return (now - last.startedAt).coerceAtLeast(0)
}

fun formatClock(ms: Long): String {
    val total = (ms / 1000).coerceAtLeast(0)
    val minutes = total / 60
    val seconds = total % 60
    return "%02d:%02d".format(minutes, seconds)
}
