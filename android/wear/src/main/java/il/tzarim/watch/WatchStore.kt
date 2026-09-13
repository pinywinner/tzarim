package il.tzarim.watch

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID

class WatchStore(context: Context) {
    private val prefs = context.getSharedPreferences("tzarim_watch", Context.MODE_PRIVATE)

    fun load(): List<Contraction> {
        val raw = prefs.getString(KEY, null) ?: return emptyList()
        return runCatching {
            val array = JSONArray(raw)
            buildList {
                for (i in 0 until array.length()) {
                    val obj = array.getJSONObject(i)
                    add(
                        Contraction(
                            id = obj.getString("id"),
                            startedAt = obj.getLong("startedAt"),
                            endedAt = if (obj.isNull("endedAt")) null else obj.getLong("endedAt"),
                        ),
                    )
                }
            }
        }.getOrDefault(emptyList())
    }

    fun save(items: List<Contraction>) {
        val array = JSONArray()
        items.takeLast(40).forEach { item ->
            array.put(
                JSONObject()
                    .put("id", item.id)
                    .put("startedAt", item.startedAt)
                    .put("endedAt", item.endedAt ?: JSONObject.NULL),
            )
        }
        prefs.edit().putString(KEY, array.toString()).apply()
    }

    fun newId(): String = UUID.randomUUID().toString()

    companion object {
        private const val KEY = "contractions"
    }
}
