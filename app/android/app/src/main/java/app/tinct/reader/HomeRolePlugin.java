package app.tinct.reader;

import android.app.Activity;
import android.app.role.RoleManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.os.Build;
import android.provider.Settings;

import androidx.activity.result.ActivityResult;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Surfaces Android's home-launcher APIs to JS so the web layer can prompt the
 * user to make Tinct their home app — the flow we want on Boox-style e-readers
 * where a single reading-first experience beats the generic launcher.
 */
@CapacitorPlugin(name = "HomeRole")
public class HomeRolePlugin extends Plugin {

    @PluginMethod
    public void isHomeRoleHeld(PluginCall call) {
        Context ctx = getContext();
        JSObject result = new JSObject();
        result.put("supported", true);
        result.put("isHome", isCurrentDefaultHome(ctx));
        call.resolve(result);
    }

    @PluginMethod
    public void requestHomeRole(PluginCall call) {
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("No activity");
            return;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            RoleManager rm = (RoleManager) activity.getSystemService(Context.ROLE_SERVICE);
            if (rm != null && rm.isRoleAvailable(RoleManager.ROLE_HOME)) {
                if (rm.isRoleHeld(RoleManager.ROLE_HOME)) {
                    JSObject result = new JSObject();
                    result.put("granted", true);
                    call.resolve(result);
                    return;
                }
                Intent intent = rm.createRequestRoleIntent(RoleManager.ROLE_HOME);
                startActivityForResult(call, intent, "homeRoleResult");
                return;
            }
        }

        // Fallback: Android 8–9 has no direct request API — send the user to the
        // default-apps settings page so they can set us as Home manually.
        Intent intent = new Intent(Settings.ACTION_HOME_SETTINGS);
        startActivityForResult(call, intent, "homeRoleResult");
    }

    @ActivityCallback
    private void homeRoleResult(PluginCall call, ActivityResult result) {
        boolean granted = isCurrentDefaultHome(getContext());
        JSObject ret = new JSObject();
        ret.put("granted", granted);
        call.resolve(ret);
    }

    /**
     * Opens Android's default-Home-app picker. Lets the user pick a different
     * launcher and release Tinct from the role — the path out for users who
     * set Tinct as Home and now want to switch back. Works on any Android
     * version: Settings.ACTION_HOME_SETTINGS is universal.
     */
    @PluginMethod
    public void openHomeAppSettings(PluginCall call) {
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("No activity");
            return;
        }
        try {
            Intent intent = new Intent(Settings.ACTION_HOME_SETTINGS);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            activity.startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Could not open Home settings: " + e.getMessage());
        }
    }

    private boolean isCurrentDefaultHome(Context ctx) {
        Intent i = new Intent(Intent.ACTION_MAIN);
        i.addCategory(Intent.CATEGORY_HOME);
        ResolveInfo info = ctx.getPackageManager().resolveActivity(i, PackageManager.MATCH_DEFAULT_ONLY);
        if (info == null || info.activityInfo == null) return false;
        return ctx.getPackageName().equals(info.activityInfo.packageName);
    }
}
