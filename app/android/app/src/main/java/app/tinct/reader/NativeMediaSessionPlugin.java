package app.tinct.reader;

import android.content.Intent;
import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Only the bundled reader can own this session; no provider secrets or audio bytes cross it. */
@CapacitorPlugin(name = "NativeMediaSession")
public class NativeMediaSessionPlugin extends Plugin {
    @PluginMethod public void start(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            try {
                NativeNarrationService.prepare(this, call);
                Intent intent = new Intent(getContext(), NativeNarrationService.class);
                if (Build.VERSION.SDK_INT >= 26) getContext().startForegroundService(intent);
                else getContext().startService(intent);
            } catch (Exception error) {
                NativeNarrationService.failStart();
                call.reject("Android playback could not start.", error);
            }
        });
    }
    @PluginMethod public void update(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            NativeNarrationService.update(call.getData());
            call.resolve();
        });
    }
    @PluginMethod public void stop(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            getContext().stopService(new Intent(getContext(), NativeNarrationService.class));
            call.resolve();
        });
    }
    void action(String name, Long position) {
        JSObject event = new JSObject();
        event.put("action", name);
        if (position != null) event.put("seekTime", position / 1000.0);
        notifyListeners("action", event);
    }
    @Override protected void handleOnDestroy() {
        getContext().stopService(new Intent(getContext(), NativeNarrationService.class));
    }
}
