package il.tzarim.watch

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.EaseInOut
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.produceState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.wear.compose.material.Button
import androidx.wear.compose.material.ButtonDefaults
import androidx.wear.compose.material.Text
import androidx.wear.compose.material.TimeText
import kotlinx.coroutines.delay

private val Bg = Color(0xFFF5F1EA)
private val Fg = Color(0xFF292724)
private val Muted = Color(0xFF5F5A53)
private val Active = Color(0xFFC95D58)
private val ActiveBg = Color(0xFFF7E9E6)
private val Calm = Color(0xFF5F7A68)
private val Danger = Color(0xFFA94747)

@Composable
fun WatchApp(model: WatchViewModel = viewModel()) {
    val items by model.items.collectAsState()
    val target by model.intensityTarget.collectAsState()
    val undo by model.undoTarget.collectAsState()
    val active = items.lastOrNull { it.endedAt == null }
    val completed = items.filter { it.endedAt != null }.sortedByDescending { it.startedAt }
    val last = completed.firstOrNull()
    val now by produceState(System.currentTimeMillis(), active?.id) {
        while (true) {
            value = System.currentTimeMillis()
            delay(if (active != null) 200 else 1000)
        }
    }
    val bg by animateColorAsState(
        if (active != null) ActiveBg else Bg,
        tween(250),
        label = "background",
    )

    Box(Modifier.fillMaxSize().background(bg), contentAlignment = Alignment.Center) {
        TimeText()
        Column(
            Modifier.fillMaxSize().padding(horizontal = 16.dp, vertical = 22.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween,
        ) {
            Spacer(Modifier.height(6.dp))
            if (active != null) {
                ActiveBlock(now - active.startedAt)
            } else {
                RestBlock(
                    last?.let { (it.endedAt ?: now) - it.startedAt },
                    if (completed.size >= 2) completed[0].startedAt - completed[1].startedAt else null,
                )
            }
            when {
                target != null -> IntensityPicker(model::setIntensity, model::dismissIntensity)
                undo != null -> UndoPicker(model::undoLast, model::dismissUndo)
                else ->
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Button(
                            onClick = { if (active != null) model.stop() else model.start() },
                            modifier = Modifier.fillMaxWidth(0.84f).height(48.dp),
                            colors =
                                ButtonDefaults.primaryButtonColors(
                                    backgroundColor = if (active != null) Danger else Calm,
                                    contentColor = Color.White,
                                ),
                        ) {
                            Text(
                                if (active != null) stringResource(R.string.stop) else stringResource(R.string.start),
                                fontSize = 17.sp,
                                fontWeight = FontWeight.Bold,
                            )
                        }
                        if (active != null) {
                            Text(
                                stringResource(R.string.accidental),
                                fontSize = 12.sp,
                                color = Muted,
                                modifier = Modifier.padding(top = 6.dp).clickable(onClick = model::cancelActive),
                            )
                        } else {
                            Text(
                                stringResource(R.string.undo_last),
                                fontSize = 12.sp,
                                color = Muted,
                                modifier = Modifier.padding(top = 6.dp).clickable(onClick = model::offerUndo),
                            )
                        }
                    }
            }
        }
    }
}

@Composable
private fun ActiveBlock(elapsed: Long) {
    val transition = rememberInfiniteTransition(label = "wave")
    val pulse by transition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(tween(2400, easing = EaseInOut), RepeatMode.Reverse),
        label = "pulse",
    )
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(stringResource(R.string.labor_active), color = Active, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
        BrandWave(
            Modifier.graphicsLayer {
                scaleX = 0.94f + 0.12f * pulse
                scaleY = 0.88f + 0.26f * pulse
            },
            0.84f + 0.16f * pulse,
        )
        Text(clock(elapsed), fontSize = 42.sp, fontWeight = FontWeight.Black, color = Fg)
        Text(stringResource(R.string.breathe), fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Fg)
    }
}

@Composable
private fun RestBlock(duration: Long?, interval: Long?) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        BrandWave()
        Text(
            stringResource(R.string.idle_hint),
            color = Muted,
            fontSize = 12.sp,
            modifier = Modifier.padding(top = 4.dp, bottom = 8.dp),
        )
        Row {
            Stat(stringResource(R.string.last_contraction), duration?.let(::clock) ?: stringResource(R.string.none))
            Spacer(Modifier.width(12.dp))
            Stat(stringResource(R.string.the_interval), interval?.let(::clock) ?: stringResource(R.string.none))
        }
    }
}

@Composable
private fun Stat(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(label, color = Muted, fontSize = 10.sp)
        Text(value, color = Fg, fontSize = 17.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun IntensityPicker(onSelect: (Int) -> Unit, onSkip: () -> Unit) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(stringResource(R.string.intensity), fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Fg)
        Row {
            (1..5).forEach { n ->
                Text(
                    n.toString(),
                    fontSize = 13.sp,
                    color = Active,
                    fontWeight = FontWeight.Bold,
                    modifier =
                        Modifier
                            .size(30.dp)
                            .clickable { onSelect(n) }
                            .padding(6.dp),
                    textAlign = TextAlign.Center,
                )
            }
        }
        Text(
            stringResource(R.string.skip),
            fontSize = 10.sp,
            color = Muted,
            modifier = Modifier.padding(top = 4.dp).clickable(onClick = onSkip),
        )
    }
}

@Composable
private fun UndoPicker(onUndo: () -> Unit, onKeep: () -> Unit) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            stringResource(R.string.undo_confirm),
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold,
            textAlign = TextAlign.Center,
            color = Fg,
        )
        Row {
            Button(
                onClick = onUndo,
                modifier = Modifier.height(36.dp),
                colors = ButtonDefaults.primaryButtonColors(backgroundColor = Danger, contentColor = Color.White),
            ) {
                Text(stringResource(R.string.undo), fontSize = 12.sp)
            }
            Spacer(Modifier.width(6.dp))
            Button(
                onClick = onKeep,
                modifier = Modifier.height(36.dp),
                colors = ButtonDefaults.primaryButtonColors(backgroundColor = Calm, contentColor = Color.White),
            ) {
                Text(stringResource(R.string.keep), fontSize = 12.sp)
            }
        }
    }
}

@Composable
private fun BrandWave(modifier: Modifier = Modifier, alpha: Float = 1f) {
    Canvas(modifier.size(84.dp, 36.dp)) {
        val path =
            Path().apply {
                moveTo(10.dp.toPx(), size.height * 0.72f)
                cubicTo(
                    size.width * 0.155f,
                    size.height * 0.72f,
                    size.width * 0.262f,
                    size.height * 0.72f,
                    size.width * 0.345f,
                    size.height * 0.39f,
                )
                cubicTo(
                    size.width * 0.405f,
                    size.height * 0.17f,
                    size.width * 0.44f,
                    size.height * 0.11f,
                    size.width * 0.5f,
                    size.height * 0.11f,
                )
                cubicTo(
                    size.width * 0.56f,
                    size.height * 0.11f,
                    size.width * 0.595f,
                    size.height * 0.17f,
                    size.width * 0.655f,
                    size.height * 0.39f,
                )
                cubicTo(
                    size.width * 0.738f,
                    size.height * 0.72f,
                    size.width * 0.845f,
                    size.height * 0.72f,
                    size.width - 10.dp.toPx(),
                    size.height * 0.72f,
                )
            }
        drawPath(
            path,
            Active.copy(alpha = alpha),
            style = Stroke(7.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round),
        )
    }
}

private fun clock(ms: Long): String {
    val seconds = ms.coerceAtLeast(0) / 1000
    return "%02d:%02d".format(seconds / 60, seconds % 60)
}
