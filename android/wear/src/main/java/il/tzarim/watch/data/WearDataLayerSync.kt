package il.tzarim.watch.data

import android.content.Context
import com.google.android.gms.tasks.Tasks
import com.google.android.gms.wearable.DataClient
import com.google.android.gms.wearable.PutDataMapRequest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class WearDataLayerSync(context: Context) {
    private val client: DataClient = com.google.android.gms.wearable.Wearable.getDataClient(context)
    private val store = WatchStore(context)

    suspend fun flushPending(): Int = withContext(Dispatchers.IO) {
        var sent = 0
        for (event in store.loadEvents()) {
            val request = PutDataMapRequest.create("/tzarim/sync").apply {
                dataMap.putString("eventId", event.eventId)
                dataMap.putString("entityId", event.entityId)
                dataMap.putString("deviceId", event.deviceId)
                dataMap.putString("operation", event.operation)
                dataMap.putLong("timestamp", event.timestamp)
                dataMap.putString("payload", event.payload)
                dataMap.putLong("sentAt", System.currentTimeMillis())
            }.asPutDataRequest().setUrgent()
            runCatching {
                Tasks.await(client.putDataItem(request))
                store.removeEvent(event.eventId)
                sent++
            }
        }
        sent
    }
}
