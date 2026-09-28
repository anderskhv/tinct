package app.tinct.reader;

import android.os.Bundle;
import android.view.ActionMode;
import android.view.KeyEvent;
import android.view.Menu;
import android.view.MenuItem;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(HomeRolePlugin.class);
        super.onCreate(savedInstanceState);

        // Suppress the Android system selection action mode (Copy / Share /
        // Select all / Web search) on text long-press, so our custom Tinct
        // selection popup (highlight colors, note, define, issue) can show
        // unobstructed. We provide an empty action-mode callback that
        // accepts the action mode (so selection still works — text still
        // becomes selectable, selectionchange fires, our JS handler runs)
        // but clears all menu items so no system bar appears.
        ActionMode.Callback emptyActionMode = new ActionMode.Callback() {
            @Override
            public boolean onCreateActionMode(ActionMode mode, Menu menu) {
                menu.clear();
                return true;
            }
            @Override
            public boolean onPrepareActionMode(ActionMode mode, Menu menu) {
                menu.clear();
                return false;
            }
            @Override
            public boolean onActionItemClicked(ActionMode mode, MenuItem item) {
                return false;
            }
            @Override
            public void onDestroyActionMode(ActionMode mode) {}
        };
        WebView webView = getBridge().getWebView();
        // WebView doesn't expose setCustomSelectionActionModeCallback as a
        // public method (it's on TextView), but the underlying View has the
        // selection-toolbar plumbing reachable via reflection. With this
        // installed, text selection still works (our JS popup fires on
        // selectionchange), but the system Copy / Share / Select all / Web
        // search toolbar is empty and most Android skins suppress it.
        try {
            webView.getClass()
                .getMethod("setCustomSelectionActionModeCallback", ActionMode.Callback.class)
                .invoke(webView, emptyActionMode);
        } catch (Exception ignored) {}

        // Keep Capacitor's BridgeWebChromeClient: it completes the original
        // microphone request after Android permission is granted, and owns
        // file selection, JavaScript dialogs and other bridge behavior.

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
