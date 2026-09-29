package app.tinct.reader;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@CapacitorPlugin(name = "NativeBooks")
public class NativeBooksPlugin extends Plugin {
    private final ExecutorService worker = Executors.newSingleThreadExecutor();
    @PluginMethod public void snapshot(PluginCall call) {
        worker.execute(() -> {
            try { call.resolve(new JSObject(NativeBooksStore.get(getContext()).snapshot().toString())); }
            catch (Exception error) { call.reject("The downloaded library could not be read.", error); }
        });
    }
    @PluginMethod public void refresh(PluginCall call) {
        worker.execute(() -> {
            try { call.resolve(new JSObject(NativeBooksStore.get(getContext()).refresh().toString())); }
            catch (Exception error) { call.reject("Connect to the internet to refresh the library.", error); }
        });
    }
    @PluginMethod public void cancel(PluginCall call) { NativeBooksStore.get(getContext()).cancel(); call.resolve(); }
    @PluginMethod public void download(PluginCall call) {
        final String id = call.getString("bookId", "");
        worker.execute(() -> {
            try {
                NativeBooksStore.get(getContext()).download(id, (done, total) -> {
                    JSObject progress = new JSObject().put("bookId", id).put("bytes", done).put("total", total);
                    notifyListeners("progress", progress);
                });
                call.resolve(new JSObject(NativeBooksStore.get(getContext()).snapshot().toString()));
            } catch (Exception error) { call.reject("The book could not be downloaded. Your saved place is unchanged.", error); }
        });
    }
    // Isolated APK acceptance serves synthetic public packs through adb reverse.
    // Production builds cannot change the publication origin.
    @PluginMethod public void testOrigin(PluginCall call) {
        if (!BuildConfig.DEBUG) { call.reject("Unavailable"); return; }
        String origin = call.getString("origin", "");
        if (!origin.matches("http://127\\.0\\.0\\.1:[0-9]{2,5}")) { call.reject("Invalid test origin"); return; }
        NativeBooksStore.get(getContext()).testOrigin(origin);
        call.resolve();
    }
}
