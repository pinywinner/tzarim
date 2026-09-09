package il.tzarim.app;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "SplashHandoff")
public class SplashHandoffPlugin extends Plugin {

    @PluginMethod
    public void land(PluginCall call) {
        MainActivity activity = (MainActivity) getActivity();
        if (activity == null) {
            call.resolve();
            return;
        }
        float x = num(call, "x");
        float y = num(call, "y");
        float width = num(call, "width");
        float height = num(call, "height");
        activity.runOnUiThread(() -> activity.landWave(x, y, width, height, call::resolve));
    }

    @PluginMethod
    public void skip(PluginCall call) {
        MainActivity activity = (MainActivity) getActivity();
        if (activity != null) {
            activity.runOnUiThread(activity::dismissWave);
        }
        call.resolve();
    }

    private static float num(PluginCall call, String key) {
        Double value = call.getDouble(key);
        if (value != null) return value.floatValue();
        Float alt = call.getFloat(key);
        return alt != null ? alt : 0f;
    }
}
