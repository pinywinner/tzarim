package il.tzarim.watch

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.wear.compose.material.MaterialTheme
import kotlinx.coroutines.flow.MutableSharedFlow

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        emitQuickStart(intent)
        setContent {
            MaterialTheme {
                WatchApp()
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        emitQuickStart(intent)
    }

    private fun emitQuickStart(intent: Intent?) {
        val extra = intent ?: return
        val quick =
            extra.getBooleanExtra("quick_start", false) ||
                extra.getStringExtra("quick_start") == "1"
        if (!quick) return
        extra.removeExtra("quick_start")
        QuickStartBridge.events.tryEmit(Unit)
    }
}

object QuickStartBridge {
    val events = MutableSharedFlow<Unit>(replay = 1, extraBufferCapacity = 1)
}
