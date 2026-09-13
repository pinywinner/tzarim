package il.tzarim.watch

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.EaseInOut
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.produceState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.res.painterResource
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

private val Cream = Color(0xFFF4EFE8)
private val Muted = Color(0xFFB9B1A7)
private val RestBg = Color(0xFF211F1D)
private val LaborBg = Color(0xFF2A1F1E)
private val Active = Color(0xFFD36B65)
private val Rest = Color(0xFF829B89)
private val Stop = Color(0xFF8F4046)

@Composable
fun WatchApp(model: WatchViewModel = viewModel()) {
    val items by model.items.collectAsState()
    val active = activeContraction(items)
    val last = lastCompleted(items)
    val now by produceState(initialValue = System.currentTimeMillis(), key1 = active?.id) {
        while (true) {
            value = System.currentTimeMillis()
            delay(if (active != null) 200 else 1000)
        }
    }

    val view = LocalView.current
    DisposableEffect(active != null) {
        view.keepScreenOn = active != null
        onDispose { view.keepScreenOn = false }
    }

    val bg by animateColorAsState(
        targetValue = if (active != null) LaborBg else RestBg,
        animationSpec = tween(280),
        label = "bg",
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(bg),
        contentAlignment = Alignment.Center,
    ) {
        TimeText()
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 14.dp, vertical = 22.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween,
        ) {
            Spacer(Modifier.height(10.dp))
            if (active != null) {
                ActiveBlock(elapsed = durationOf(active, now))
            } else {
                RestBlock(
                    lastDuration = last?.let { durationOf(it) },
                    interval = intervalSoFar(items, now),
                )
            }
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Button(
                    onClick = { if (active != null) model.stop() else model.start() },
                    modifier = Modifier
                        .fillMaxWidth(0.78f)
                        .height(46.dp),
                    colors = ButtonDefaults.buttonColors(
                        backgroundColor = if (active != null) Stop else Rest,
                        contentColor = Cream,
                    ),
                    shape = RoundedCornerShape(18.dp),
                ) {
                    Text(
                        text = stringResource(if (active != null) R.string.stop else R.string.start),
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                    )
                }
                if (active != null) {
                    Button(
                        onClick = { model.cancelActive() },
                        colors = ButtonDefaults.buttonColors(
                            backgroundColor = Color.Transparent,
                            contentColor = Muted,
                        ),
                        modifier = Modifier.height(32.dp),
                    ) {
                        Text(stringResource(R.string.accidental), fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    }
                } else {
                    Spacer(Modifier.height(32.dp))
                }
            }
        }
    }
}

@Composable
private fun ActiveBlock(elapsed: Long) {
    val breathe by rememberInfiniteTransition(label = "wave").animateFloat(
        initialValue = 0.94f,
        targetValue = 1.08f,
        animationSpec = infiniteRepeatable(
            animation = tween(2400, easing = EaseInOut),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "breathe",
    )
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = stringResource(R.string.labor_active),
            color = Active,
            fontSize = 13.sp,
            fontWeight = FontWeight.SemiBold,
        )
        Wave(Modifier.scale(breathe))
        Text(
            text = formatClock(elapsed),
            color = Cream,
            fontSize = 34.sp,
            fontWeight = FontWeight.Black,
            modifier = Modifier.padding(top = 2.dp),
        )
        Text(
            text = stringResource(R.string.breathe),
            color = Cream,
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
        )
    }
}

@Composable
private fun RestBlock(lastDuration: Long?, interval: Long?) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Wave()
        Text(
            text = stringResource(R.string.idle_hint),
            color = Muted,
            fontSize = 12.sp,
            modifier = Modifier.padding(top = 4.dp, bottom = 8.dp),
        )
        Row(horizontalArrangement = Arrangement.Center) {
            Stat(
                label = stringResource(R.string.last_contraction),
                value = lastDuration?.let(::formatClock) ?: stringResource(R.string.none),
            )
            Spacer(Modifier.width(16.dp))
            Stat(
                label = stringResource(R.string.the_interval),
                value = interval?.let(::formatClock) ?: stringResource(R.string.none),
            )
        }
    }
}

@Composable
private fun Stat(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(label, color = Muted, fontSize = 11.sp)
        Text(value, color = Cream, fontSize = 18.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
    }
}

@Composable
private fun Wave(modifier: Modifier = Modifier) {
    Image(
        painter = painterResource(R.drawable.ic_wave),
        contentDescription = null,
        colorFilter = ColorFilter.tint(Active),
        modifier = modifier.size(width = 92.dp, height = 40.dp),
    )
}
