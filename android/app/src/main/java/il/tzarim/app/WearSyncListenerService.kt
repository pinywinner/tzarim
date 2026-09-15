package il.tzarim.app

import com.google.android.gms.wearable.DataEvent
import com.google.android.gms.wearable.DataEventBuffer
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.WearableListenerService

class WearSyncListenerService : WearableListenerService() {
    override fun onDataChanged(events: DataEventBuffer) {
        events.forEach { event ->
            if (event.type != DataEvent.TYPE_CHANGED) return@forEach
            if (event.dataItem.uri.path != "/tzarim/sync") return@forEach
            val map = DataMapItem.fromDataItem(event.dataItem).dataMap
            val id = map.getString("eventId") ?: return@forEach
            WearSyncEventStore(applicationContext).applyOnce(
                id,
                map.getString("entityId") ?: "",
                map.getString("operation") ?: "",
                map.getLong("timestamp"),
                map.getString("payload") ?: "{}",
            )
        }
    }
}
