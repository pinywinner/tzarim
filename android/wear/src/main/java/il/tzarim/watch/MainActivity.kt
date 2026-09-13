package il.tzarim.watch

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.ui.graphics.Color
import androidx.wear.compose.material.Colors
import androidx.wear.compose.material.MaterialTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(
                colors = Colors(
                    primary = Color(0xFFD36B65),
                    primaryVariant = Color(0xFF8F4046),
                    secondary = Color(0xFF829B89),
                    secondaryVariant = Color(0xFF829B89),
                    background = Color(0xFF211F1D),
                    surface = Color(0xFF2B2825),
                    error = Color(0xFFA94747),
                    onPrimary = Color(0xFFF4EFE8),
                    onSecondary = Color(0xFFF4EFE8),
                    onBackground = Color(0xFFF4EFE8),
                    onSurface = Color(0xFFF4EFE8),
                    onError = Color(0xFFF4EFE8),
                ),
            ) {
                WatchApp()
            }
        }
    }
}
