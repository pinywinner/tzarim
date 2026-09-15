package il.tzarim.app

import android.content.Context

class WearSyncEventStore(context: Context) {
    private val prefs = context.getSharedPreferences("tzarim_wear_sync", Context.MODE_PRIVATE)

    fun applyOnce(
        eventId: String,
        entityId: String,
        operation: String,
        timestamp: Long,
        payload: String,
    ): Boolean {
        if (prefs.getBoolean("event:$eventId", false)) return false
        prefs.edit().putBoolean("event:$eventId", true).apply()
        return true
    }
}
