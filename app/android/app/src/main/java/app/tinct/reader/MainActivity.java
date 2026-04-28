package app.tinct.reader;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.view.KeyEvent;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final int REQ_RECORD_AUDIO = 1001;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(HomeRolePlugin.class);
        super.onCreate(savedInstanceState);

        // Permission delegate: when the WebView's page calls
        // getUserMedia / SpeechRecognition, Android wraps that in a
        // PermissionRequest. Default Capacitor behaviour is to deny silently
        // (mic immediately unavailable, voice mode appears to "fast-fail").
        // Auto-grant if the app already has Android-level permission.
        getBridge().getWebView().setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> {
                    String[] requested = request.getResources();
                    boolean wantsAudio = false;
                    for (String r : requested) {
                        if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(r)) {
                            wantsAudio = true;
                            break;
                        }
                    }
                    if (!wantsAudio) {
                        request.deny();
                        return;
                    }
                    int granted = ContextCompat.checkSelfPermission(
                        MainActivity.this, Manifest.permission.RECORD_AUDIO);
                    if (granted == PackageManager.PERMISSION_GRANTED) {
                        request.grant(new String[] { PermissionRequest.RESOURCE_AUDIO_CAPTURE });
                    } else {
                        // Ask Android for the permission. The WebView request
                        // is denied for now; the user will tap mic again after
                        // granting and the second attempt succeeds.
                        ActivityCompat.requestPermissions(
                            MainActivity.this,
                            new String[] { Manifest.permission.RECORD_AUDIO },
                            REQ_RECORD_AUDIO
                        );
                        request.deny();
                    }
                });
            }
        });
    }

    /**
     * Intercept hardware key events (Boox page-turn buttons map to VOLUME keys).
     */
    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        if (event.getAction() == KeyEvent.ACTION_DOWN) {
            switch (event.getKeyCode()) {
                case KeyEvent.KEYCODE_VOLUME_UP:
                case KeyEvent.KEYCODE_PAGE_UP:
                    getBridge().getWebView().evaluateJavascript(
                        "window.dispatchEvent(new CustomEvent('tinct:page-nav', {detail:{direction:'prev'}}))",
                        null
                    );
                    return true;
                case KeyEvent.KEYCODE_VOLUME_DOWN:
                case KeyEvent.KEYCODE_PAGE_DOWN:
                    getBridge().getWebView().evaluateJavascript(
                        "window.dispatchEvent(new CustomEvent('tinct:page-nav', {detail:{direction:'next'}}))",
                        null
                    );
                    return true;
            }
        }
        if (event.getAction() == KeyEvent.ACTION_UP) {
            switch (event.getKeyCode()) {
                case KeyEvent.KEYCODE_VOLUME_UP:
                case KeyEvent.KEYCODE_VOLUME_DOWN:
                    return true;
            }
        }
        return super.dispatchKeyEvent(event);
    }
}
