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
import android.view.animation.AccelerateDecelerateInterpolator;
import android.view.animation.DecelerateInterpolator;
import android.webkit.WebView;
import android.widget.FrameLayout;
import android.widget.ImageView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final int CREAM = Color.rgb(245, 241, 234);
    private static final float START_SCALE = 6.2f;
    private static final long PULSE_MS = 420L;
    private static final long LAND_MS = 560L;
    private static final long HOLD_MS = 80L;
    private static final long FADE_MS = 160L;
    private static final long FAILSAFE_MS = 2200L;

    private FrameLayout overlay;
    private View cream;
    private ImageView wave;
    private Animator running;
    private boolean pulseDone;
    private boolean landing;
    private boolean dismissed;
    private float pendingX = Float.NaN;
    private float pendingY;
    private float pendingW;
    private float pendingH;
    private Runnable pendingDone;
    private final Runnable failsafe = this::dismissWave;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(SplashHandoffPlugin.class);
        super.onCreate(savedInstanceState);
        playWaveEntrance();
    }

    private void playWaveEntrance() {
        if (overlay != null || isFinishing() || dismissed) return;

        overlay = new FrameLayout(this);
        overlay.setClickable(true);
        overlay.setFocusable(true);

        cream = new View(this);
        cream.setBackgroundColor(CREAM);
        overlay.addView(
            cream,
            new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        );

        wave = new ImageView(this);
        wave.setImageResource(R.drawable.ic_wave);
        wave.setScaleType(ImageView.ScaleType.FIT_CENTER);
        FrameLayout.LayoutParams waveParams = new FrameLayout.LayoutParams(dp(112), dp(48));
        waveParams.gravity = Gravity.CENTER;
        overlay.addView(wave, waveParams);

        addContentView(
            overlay,
            new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        );

        wave.setScaleX(START_SCALE);
        wave.setScaleY(START_SCALE);

        ObjectAnimator pulseX = ObjectAnimator.ofFloat(wave, View.SCALE_X, START_SCALE, 6.4f, START_SCALE);
        ObjectAnimator pulseY = ObjectAnimator.ofFloat(wave, View.SCALE_Y, START_SCALE, 7.2f, START_SCALE);
        pulseX.setDuration(PULSE_MS);
        pulseY.setDuration(PULSE_MS);
        pulseX.setInterpolator(new AccelerateDecelerateInterpolator());
        pulseY.setInterpolator(new AccelerateDecelerateInterpolator());

        AnimatorSet pulse = new AnimatorSet();
        pulse.playTogether(pulseX, pulseY);
        pulse.addListener(new AnimatorListenerAdapter() {
            @Override
            public void onAnimationEnd(Animator animation) {
                if (dismissed) return;
                pulseDone = true;
                if (!Float.isNaN(pendingX)) {
                    animateTo(pendingX, pendingY, pendingW, pendingH, pendingDone);
                }
            }
        });
        running = pulse;
        pulse.start();
        overlay.postDelayed(failsafe, FAILSAFE_MS);
    }

    public void landWave(float cssX, float cssY, float cssW, float cssH, Runnable done) {
        if (dismissed) {
            if (done != null) done.run();
            return;
        }
        if (wave == null || !pulseDone) {
            pendingX = cssX;
            pendingY = cssY;
            pendingW = cssW;
            pendingH = cssH;
            pendingDone = done;
            if (wave == null) playWaveEntrance();
            return;
        }
        animateTo(cssX, cssY, cssW, cssH, done);
    }

    public void dismissWave() {
        if (dismissed) return;
        dismissed = true;
        if (overlay != null) overlay.removeCallbacks(failsafe);
        if (running != null) running.cancel();
        if (overlay == null) {
            finishPending();
            return;
        }
        ObjectAnimator fade = ObjectAnimator.ofFloat(overlay, View.ALPHA, 1f, 0f);
        fade.setDuration(FADE_MS);
        fade.addListener(new AnimatorListenerAdapter() {
            @Override
            public void onAnimationEnd(Animator animation) {
                finishPending();
                removeOverlay();
            }
        });
        fade.start();
    }

    private void animateTo(float cssX, float cssY, float cssW, float cssH, Runnable done) {
        if (landing || dismissed) {
            if (done != null && pendingDone != done) done.run();
            return;
        }
        landing = true;
        pendingDone = done;
        if (wave == null || overlay == null) {
            finishPending();
            return;
        }

        WebView webView = getBridge() != null ? getBridge().getWebView() : null;
        float dpr = getResources().getDisplayMetrics().density;
        int[] webLoc = new int[] {0, 0};
        int[] ovLoc = new int[] {0, 0};
        if (webView != null) webView.getLocationInWindow(webLoc);
        overlay.getLocationInWindow(ovLoc);

        float targetW = Math.max(cssW * dpr, 1f);
        float targetH = Math.max(cssH * dpr, 1f);
        float targetCx = webLoc[0] - ovLoc[0] + cssX * dpr + targetW / 2f;
        float targetCy = webLoc[1] - ovLoc[1] + cssY * dpr + targetH / 2f;

        float layoutW = wave.getWidth() > 0 ? wave.getWidth() : dp(112);
        float endScale = targetW / layoutW;
        float tx = targetCx - overlay.getWidth() / 2f;
        float ty = targetCy - overlay.getHeight() / 2f;

        if (running != null) running.cancel();

        ObjectAnimator sx = ObjectAnimator.ofFloat(wave, View.SCALE_X, wave.getScaleX(), endScale);
        ObjectAnimator sy = ObjectAnimator.ofFloat(wave, View.SCALE_Y, wave.getScaleY(), endScale);
        ObjectAnimator x = ObjectAnimator.ofFloat(wave, View.TRANSLATION_X, 0f, tx);
        ObjectAnimator y = ObjectAnimator.ofFloat(wave, View.TRANSLATION_Y, 0f, ty);
        DecelerateInterpolator ease = new DecelerateInterpolator(1.8f);
        for (ObjectAnimator animator : new ObjectAnimator[] {sx, sy, x, y}) {
            animator.setDuration(LAND_MS);
            animator.setInterpolator(ease);
        }

        AnimatorSet land = new AnimatorSet();
        land.playTogether(sx, sy, x, y);
        land.addListener(new AnimatorListenerAdapter() {
            @Override
            public void onAnimationEnd(Animator animation) {
                if (dismissed || overlay == null) return;
                overlay.postDelayed(() -> fadeCreamThenFinish(), HOLD_MS);
            }
        });
        running = land;
        land.start();
    }

    private void fadeCreamThenFinish() {
        if (dismissed) return;
        dismissed = true;
        if (overlay != null) overlay.removeCallbacks(failsafe);
        if (cream == null) {
            finishPending();
            removeOverlay();
            return;
        }
        ObjectAnimator fade = ObjectAnimator.ofFloat(cream, View.ALPHA, 1f, 0f);
        fade.setDuration(FADE_MS);
        fade.setInterpolator(new DecelerateInterpolator());
        fade.addListener(new AnimatorListenerAdapter() {
            @Override
            public void onAnimationEnd(Animator animation) {
                finishPending();
                if (overlay != null) overlay.postDelayed(MainActivity.this::removeOverlay, 48);
            }
        });
        fade.start();
    }

    private void finishPending() {
        Runnable done = pendingDone;
        pendingDone = null;
        if (done != null) done.run();
    }

    private void removeOverlay() {
        if (overlay == null) return;
        overlay.removeCallbacks(failsafe);
        ViewGroup parent = (ViewGroup) overlay.getParent();
        if (parent != null) parent.removeView(overlay);
        overlay = null;
        cream = null;
        wave = null;
        running = null;
    }

    @Override
    public void onDestroy() {
        dismissed = true;
        if (overlay != null) overlay.removeCallbacks(failsafe);
        if (running != null) running.cancel();
        super.onDestroy();
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }
}
