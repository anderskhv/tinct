package app.tinct.reader;

import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.AtomicFile;
import android.util.Base64;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import org.json.JSONObject;

/** Awaited, encrypted sign-in state survives process death during the browser round-trip. */
@CapacitorPlugin(name = "NativeAuthStorage")
public class NativeAuthStoragePlugin extends Plugin {
    private final ExecutorService worker = Executors.newSingleThreadExecutor();
    private static final String ALIAS = "tinct-auth-v1";
    private String checkedKey(PluginCall call) throws Exception {
        String key = call.getString("key", "");
        if (!key.equals("tinct:native-auth-pending") && !key.matches("sb-[a-z0-9-]{1,100}-auth-token(?:-code-verifier|-user)?"))
            throw new IllegalArgumentException("Unsupported sign-in key");
        return key;
    }
    private AtomicFile file(String key) {
        File dir = new File(getContext().getNoBackupFilesDir(), "sign-in");
        dir.mkdirs();
        return new AtomicFile(new File(dir, key.replace(':', '_') + ".bin"));
    }
    private SecretKey key() throws Exception {
        KeyStore store = KeyStore.getInstance("AndroidKeyStore"); store.load(null);
        if (store.containsAlias(ALIAS)) return (SecretKey) store.getKey(ALIAS, null);
        KeyGenerator generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore");
        generator.init(new KeyGenParameterSpec.Builder(ALIAS, KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).build());
        return generator.generateKey();
    }
    @PluginMethod public void get(PluginCall call) {
        worker.execute(() -> {
            try {
                String name = checkedKey(call); AtomicFile target = file(name);
                if (!target.getBaseFile().exists() && !new File(target.getBaseFile().getPath() + ".bak").exists()) { call.resolve(new JSObject().put("found", false)); return; }
                JSONObject envelope = new JSONObject(new String(target.readFully(), StandardCharsets.UTF_8));
                Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
                cipher.init(Cipher.DECRYPT_MODE, key(), new GCMParameterSpec(128, Base64.decode(envelope.getString("iv"), Base64.NO_WRAP)));
                cipher.updateAAD(name.getBytes(StandardCharsets.UTF_8));
                JSONObject value = new JSONObject(new String(cipher.doFinal(Base64.decode(envelope.getString("data"), Base64.NO_WRAP)), StandardCharsets.UTF_8));
                call.resolve(new JSObject().put("found", true).put("value", value.opt("value")));
            } catch (Exception error) { call.reject("Saved sign-in could not be read.", error); }
        });
    }
    private void write(PluginCall call, boolean remove) {
        worker.execute(() -> {
            FileOutputStream stream = null; AtomicFile target = null;
            try {
                String name = checkedKey(call), value = remove ? null : call.getString("value");
                if (!remove && (value == null || value.length() > 65536)) throw new IllegalArgumentException("Invalid sign-in value");
                Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
                cipher.init(Cipher.ENCRYPT_MODE, key()); cipher.updateAAD(name.getBytes(StandardCharsets.UTF_8));
                byte[] encrypted = cipher.doFinal(new JSONObject().put("value", value == null ? JSONObject.NULL : value).toString().getBytes(StandardCharsets.UTF_8));
                JSONObject envelope = new JSONObject().put("iv", Base64.encodeToString(cipher.getIV(), Base64.NO_WRAP))
                    .put("data", Base64.encodeToString(encrypted, Base64.NO_WRAP));
                target = file(name); stream = target.startWrite();
                stream.write(envelope.toString().getBytes(StandardCharsets.UTF_8));
                target.finishWrite(stream); stream = null;
                call.resolve();
            } catch (Exception error) {
                if (target != null && stream != null) target.failWrite(stream);
                call.reject("Sign-in could not be saved. Please try again.", error);
            }
        });
    }
    @PluginMethod public void set(PluginCall call) { write(call, false); }
    @PluginMethod public void remove(PluginCall call) { write(call, true); }
}
