package il.tzarim.app;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.animation.AnimatorSet;
import android.animation.ObjectAnimator;
import android.graphics.Color;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.animation.DecelerateInterpolator;
import android.view.animation.OvershootInterpolator;
import android.widget.FrameLayout;
import android.widget.ImageView;

import androidx.core.splashscreen.SplashScreen;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final long LOGO_SETTLE_DURATION = 780L;
    private static final long FADE_OUT_DURATION = 120L;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        SplashScreen splashScreen = SplashScreen.installSplashScreen(this);
        super.onCreate(savedInstanceState);

        // The native splash gives us the instant Android launch experience.
        // This second, full-screen layer creates the branded motion we want:
        // one huge wave that shrinks directly into the wave already visible
        // in the center of the first web screen.
        splashScreen.setOnExitAnimationListener(splashScreenViewProvider -> {
            // Let the system splash disappear immediately; the custom layer
            // below keeps the visual transition continuous.
            splashScreenViewProvider.remove();
            playWaveEntrance();
        });
    }

    private void playWaveEntrance() {
        final FrameLayout overlay = new FrameLayout(this);
        overlay.setBackgroundColor(Color.rgb(243, 238, 230));
        overlay.setClickable(true);
        overlay.setFocusable(true);

        final ImageView wave = new ImageView(this);
        wave.setImageResource(il.tzarim.app.R.drawable.ic_wave);
        wave.setScaleType(ImageView.ScaleType.FIT_CENTER);

        final int width = dp(112);
        final int height = dp(48);
        final FrameLayout.LayoutParams waveParams = new FrameLayout.LayoutParams(width, height);
        waveParams.gravity = Gravity.CENTER;
        overlay.addView(wave, waveParams);

        addContentView(
                overlay,
                new ViewGroup.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT
                )
        );

        // Start absurdly large, so the user enters through the wave itself.
        wave.setScaleX(5.6f);
        wave.setScaleY(5.6f);

        final ObjectAnimator settleX = ObjectAnimator.ofFloat(wave, View.SCALE_X, 5.6f, 1.10f);
        final ObjectAnimator settleY = ObjectAnimator.ofFloat(wave, View.SCALE_Y, 5.6f, 1.10f);
        settleX.setDuration(LOGO_SETTLE_DURATION);
        settleY.setDuration(LOGO_SETTLE_DURATION);
        settleX.setInterpolator(new DecelerateInterpolator(2.2f));
        settleY.setInterpolator(new DecelerateInterpolator(2.2f));

        final ObjectAnimator finalX = ObjectAnimator.ofFloat(wave, View.SCALE_X, 1.10f, 1.0f);
        final ObjectAnimator finalY = ObjectAnimator.ofFloat(wave, View.SCALE_Y, 1.10f, 1.0f);
        finalX.setDuration(180L);
        finalY.setDuration(180L);
        finalX.setInterpolator(new OvershootInterpolator(0.65f));
        finalY.setInterpolator(new OvershootInterpolator(0.65f));

        final AnimatorSet logoSettle = new AnimatorSet();
        logoSettle.playTogether(settleX, settleY);
        logoSettle.addListener(new AnimatorListenerAdapter() {
            @Override
            public void onAnimationEnd(Animator animation) {
                final AnimatorSet finalSet = new AnimatorSet();
                finalSet.playTogether(finalX, finalY);
                finalSet.addListener(new AnimatorListenerAdapter() {
                    @Override
                    public void onAnimationEnd(Animator animation) {
                        ObjectAnimator fade = ObjectAnimator.ofFloat(overlay, View.ALPHA, 1f, 0f);
                        fade.setDuration(FADE_OUT_DURATION);
                        fade.setInterpolator(new DecelerateInterpolator());
                        fade.addListener(new AnimatorListenerAdapter() {
                            @Override
                            public void onAnimationEnd(Animator animation) {
                                ViewGroup parent = (ViewGroup) overlay.getParent();
                                if (parent != null) {
                                    parent.removeView(overlay);
                                }
                            }
                        });
                        fade.start();
                    }
                });
                finalSet.start();
            }
        });

        logoSettle.start();
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }
}
