package il.tzarim.watch.tile

import androidx.concurrent.futures.CallbackToFutureAdapter
import androidx.wear.tiles.ActionBuilders
import androidx.wear.tiles.DimensionBuilders
import androidx.wear.tiles.LayoutElementBuilders
import androidx.wear.tiles.RequestBuilders
import androidx.wear.tiles.TileBuilders
import androidx.wear.tiles.TileService
import com.google.common.util.concurrent.ListenableFuture
import il.tzarim.watch.data.WatchRepositoryImpl
import java.util.concurrent.TimeUnit

class TzarimTileService : TileService() {
    override fun onTileRequest(
        requestParams: RequestBuilders.TileRequest,
    ): ListenableFuture<TileBuilders.Tile> =
        CallbackToFutureAdapter.getFuture { completer ->
            val session = WatchRepositoryImpl(this).session.value
            val active = session.contractions.lastOrNull { it.endedAt == null }
            val label = if (active == null) "צירים" else "ציר פעיל"
            val detail =
                if (active == null) {
                    "התחל מדידה"
                } else {
                    val seconds = (System.currentTimeMillis() - active.startedAt).coerceAtLeast(0) / 1000
                    "פעיל %02d:%02d".format(seconds / 60, seconds % 60)
                }
            val action =
                ActionBuilders.LaunchAction.Builder()
                    .setAndroidActivity(
                        ActionBuilders.AndroidActivity.Builder()
                            .setClassName("il.tzarim.watch.MainActivity")
                            .setPackageName(packageName)
                            .addKeyToExtraMapping(
                                "quick_start",
                                ActionBuilders.stringExtra(if (active == null) "1" else "0"),
                            )
                            .build(),
                    )
                    .build()
            val text =
                LayoutElementBuilders.Column.Builder()
                    .setHorizontalAlignment(LayoutElementBuilders.HORIZONTAL_ALIGN_CENTER)
                    .addContent(LayoutElementBuilders.Text.Builder().setText(label).build())
                    .addContent(LayoutElementBuilders.Text.Builder().setText(detail).build())
                    .build()
            val root =
                LayoutElementBuilders.Box.Builder()
                    .addContent(text)
                    .setWidth(DimensionBuilders.expand())
                    .setHeight(DimensionBuilders.expand())
                    .setModifiers(
                        LayoutElementBuilders.Modifiers.Builder()
                            .setClickable(
                                LayoutElementBuilders.Clickable.Builder().setOnClick(action).build(),
                            )
                            .build(),
                    )
                    .build()
            completer.set(
                TileBuilders.Tile.Builder()
                    .setResourcesVersion("4")
                    .setFreshnessIntervalMillis(TimeUnit.SECONDS.toMillis(20))
                    .setLayout(LayoutElementBuilders.Layout.Builder().setRoot(root).build())
                    .build(),
            )
            "tile"
        }

    override fun onTileResourcesRequest(
        requestParams: RequestBuilders.ResourcesRequest,
    ): ListenableFuture<TileBuilders.Resources> =
        CallbackToFutureAdapter.getFuture { completer ->
            completer.set(TileBuilders.Resources.Builder().setVersion("4").build())
            "resources"
        }
}
