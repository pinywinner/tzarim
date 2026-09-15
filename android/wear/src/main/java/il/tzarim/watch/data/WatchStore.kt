package il.tzarim.watch.data

import android.content.Context
import il.tzarim.watch.domain.Session
import il.tzarim.watch.domain.SyncEvent
import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID

class WatchStore(context: Context) {
    private val prefs = context.getSharedPreferences("tzarim_watch", Context.MODE_PRIVATE)

    fun deviceId(): String =
        prefs.getString(KEY_DEVICE_ID, null) ?: UUID.randomUUID().toString().also {
            prefs.edit().putString(KEY_DEVICE_ID, it).apply()
        }

    fun loadSession(): Session? {
        val raw = prefs.getString(KEY_SESSION, null) ?: return null
        return runCatching { parseSession(JSONObject(raw)) }.getOrNull()
    }

    fun saveSession(session: Session) {
        prefs.edit().putString(KEY_SESSION, session.toJson().toString()).apply()
    }

    fun enqueue(event: SyncEvent) {
        val events = loadEvents().toMutableList()
        if (events.any { it.eventId == event.eventId }) return
        events.add(event)
        val array = JSONArray()
        events.takeLast(200).forEach { array.put(it.toJson()) }
        prefs.edit().putString(KEY_EVENTS, array.toString()).apply()
    }

    fun loadEvents(): List<SyncEvent> {
        val raw = prefs.getString(KEY_EVENTS, null) ?: return emptyList()
        return runCatching {
            val array = JSONArray(raw)
            buildList {
                for (i in 0 until array.length()) {
                    val o = array.getJSONObject(i)
                    add(SyncEvent(
                        o.getString("eventId"), o.getString("entityId"), o.getString("deviceId"),
                        o.getString("operation"), o.getLong("timestamp"), o.optString("payload"),
                    ))
                }
            }
        }.getOrDefault(emptyList())
    }

    fun removeEvent(eventId: String) {
        val remaining = loadEvents().filterNot { it.eventId == eventId }
        val array = JSONArray()
        remaining.forEach { array.put(it.toJson()) }
        prefs.edit().putString(KEY_EVENTS, array.toString()).apply()
    }

    private fun Session.toJson() = JSONObject().apply {
        put("id", id)
        put("startedAt", startedAt)
        put("endedAt", endedAt ?: JSONObject.NULL)
        put("waterBrokeAt", waterBrokeAt ?: JSONObject.NULL)
        put("updatedAt", updatedAt)
        val array = JSONArray()
        contractions.forEach { c ->
            array.put(JSONObject().apply {
                put("id", c.id); put("startedAt", c.startedAt)
                put("endedAt", c.endedAt ?: JSONObject.NULL)
                put("intensity", c.intensity ?: JSONObject.NULL)
                put("source", c.source.name); put("updatedAt", c.updatedAt)
            })
        }
        put("contractions", array)
    }

    private fun parseSession(o: JSONObject): Session {
        val array = o.optJSONArray("contractions") ?: JSONArray()
        val contractions = buildList {
            for (i in 0 until array.length()) {
                val c = array.getJSONObject(i)
                add(il.tzarim.watch.domain.Contraction(
                    id = c.getString("id"),
                    startedAt = c.getLong("startedAt"),
                    endedAt = if (c.isNull("endedAt")) null else c.getLong("endedAt"),
                    intensity = if (c.isNull("intensity")) null else c.getInt("intensity"),
                    source = runCatching { il.tzarim.watch.domain.ContractionSource.valueOf(c.optString("source")) }.getOrDefault(il.tzarim.watch.domain.ContractionSource.WATCH),
                    updatedAt = c.optLong("updatedAt", c.getLong("startedAt")),
                ))
            }
        }
        return Session(
            id = o.getString("id"), startedAt = o.getLong("startedAt"),
            endedAt = if (o.isNull("endedAt")) null else o.getLong("endedAt"),
            contractions = contractions,
            waterBrokeAt = if (o.isNull("waterBrokeAt")) null else o.getLong("waterBrokeAt"),
            updatedAt = o.optLong("updatedAt", o.getLong("startedAt")),
        )
    }

    private fun SyncEvent.toJson() = JSONObject().apply {
        put("eventId", eventId); put("entityId", entityId); put("deviceId", deviceId)
        put("operation", operation); put("timestamp", timestamp); put("payload", payload)
    }

    companion object {
        private const val KEY_SESSION = "session"
        private const val KEY_EVENTS = "sync_events"
        private const val KEY_DEVICE_ID = "device_id"
    }
}
