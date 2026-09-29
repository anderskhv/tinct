package app.tinct.reader;

import android.content.Context;
import android.webkit.WebResourceResponse;
import android.util.AtomicFile;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import org.json.JSONArray;
import org.json.JSONObject;

/** Public book files only. Reader places, annotations and accounts are never stored here. */
final class NativeBooksStore {
    interface Progress { void update(long bytes, long total); }
    private static NativeBooksStore instance;
    static synchronized NativeBooksStore get(Context context) {
        if (instance == null) instance = new NativeBooksStore(context.getApplicationContext());
        return instance;
    }
    private final Context context;
    private final File root;
    private final Map<String, File> activeFiles = new ConcurrentHashMap<>();
    private final Map<String, JSONObject> pinned = new ConcurrentHashMap<>();
    private volatile JSONObject index;
    private volatile String origin = "https://tinct.app";
    private volatile boolean cancelled;
    private final Set<String> bundled = new HashSet<>();

    private NativeBooksStore(Context context) {
        this.context = context;
        root = new File(context.getNoBackupFilesDir(), "native-books");
        root.mkdirs();
        try {
            index = readJsonAsset("public/native-books/index.json");
            JSONObject config = readJsonAsset("public/native-books/bundled.json");
            JSONArray ids = config.getJSONArray("books");
            for (int i = 0; i < ids.length(); i++) { String id = ids.getString(i); bundled.add(id); pinned.put(id, entry(id)); }
            File cached = new File(root, "index.json");
            if (cached.exists()) {
                try { index = readJson(cached); } catch (Exception damagedIndex) { android.util.Log.w("TinctBooks", "Using the bundled public catalogue"); }
            }
            File[] entries = root.listFiles();
            if (entries != null) for (File dir : entries) {
                if (!dir.isDirectory() || !dir.getName().matches("[a-z0-9][a-z0-9-]{0,79}")) continue;
                File pointer = new File(dir, "active.json");
                if (!pointer.exists()) continue;
                try {
                JSONObject entry = readJson(pointer);
                String revision = entry.getString("revision");
                if (!revision.matches("[a-f0-9]{64}")) continue;
                File pack = new File(dir, revision);
                JSONObject manifest = readJson(new File(pack, "manifest.json"));
                validate(manifest, dir.getName());
                activate(entry, manifest, pack);
                } catch (Exception damaged) { android.util.Log.w("TinctBooks", "A public book download needs repair"); }
            }
        } catch (Exception error) {
            // A damaged public download never clears saved reader data or other packs.
            android.util.Log.w("TinctBooks", "Could not restore all public book downloads", error);
        }
    }
    void cancel() { cancelled = true; }
    void testOrigin(String value) { if (BuildConfig.DEBUG) origin = value; }
    private JSONObject readJsonAsset(String path) throws Exception {
        try (InputStream stream = context.getAssets().open(path)) {
            return new JSONObject(new String(readBytes(stream), StandardCharsets.UTF_8));
        }
    }
    private static JSONObject readJson(File file) throws Exception {
        return new JSONObject(new String(new AtomicFile(file).readFully(), StandardCharsets.UTF_8));
    }
    private static byte[] readBytes(InputStream stream) throws IOException {
        ByteArrayOutputStream result = new ByteArrayOutputStream(); byte[] buffer = new byte[32768]; int count;
        while ((count = stream.read(buffer)) != -1) result.write(buffer, 0, count);
        return result.toByteArray();
    }
    private static byte[] fileBytes(File file) throws IOException {
        try (InputStream stream = new FileInputStream(file)) { return readBytes(stream); }
    }
    private static void atomicJson(File file, JSONObject value) throws Exception {
        AtomicFile target = new AtomicFile(file); FileOutputStream stream = null;
        try {
            stream = target.startWrite(); stream.write(value.toString().getBytes(StandardCharsets.UTF_8));
            target.finishWrite(stream);
        } catch (Exception error) { if (stream != null) target.failWrite(stream); throw error; }
    }
    private JSONObject entry(String id) throws Exception {
        if (index == null) throw new IOException("Missing catalogue");
        JSONArray entries = index.getJSONArray("books");
        for (int i = 0; i < entries.length(); i++) {
            JSONObject entry = entries.getJSONObject(i);
            if (id.equals(entry.getString("id"))) return entry;
        }
        throw new IOException("Book is not published");
    }
    private static Set<String> editionKeys(JSONObject entry) throws Exception {
        Set<String> result = new HashSet<>();
        JSONArray editions = entry.getJSONObject("book").getJSONArray("editions");
        for (int i = 0; i < editions.length(); i++) result.add(editions.getJSONObject(i).getString("key"));
        return result;
    }
    /** Add supported new edition identities, never replace already downloaded text. */
    private static JSONObject extendEntry(JSONObject installed, JSONObject published) throws Exception {
        JSONObject result = new JSONObject(installed.toString());
        for (String field : new String[]{"book", "view"}) {
            JSONArray target = result.getJSONObject(field).getJSONArray("editions");
            JSONArray source = published.getJSONObject(field).getJSONArray("editions");
            Set<String> existing = new HashSet<>();
            for (int i = 0; i < target.length(); i++) existing.add(target.getJSONObject(i).getString("key"));
            for (int i = 0; i < source.length(); i++) if (existing.add(source.getJSONObject(i).getString("key"))) target.put(source.getJSONObject(i));
        }
        Set<String> shards = new LinkedHashSet<>();
        for (JSONObject entry : new JSONObject[]{installed, published}) {
            JSONArray values = entry.optJSONArray("shardedEditions");
            if (values != null) for (int i = 0; i < values.length(); i++) shards.add(values.getString(i));
        }
        result.put("shardedEditions", new JSONArray(shards));
        result.put("bytes", published.getLong("bytes"));
        return result;
    }
    private byte[] installedBytes(String path) throws Exception {
        File saved = activeFiles.get(path);
        if (saved != null) return fileBytes(saved);
        try (InputStream stream = context.getAssets().open("public" + path)) { return readBytes(stream); }
    }
    private JSONObject installedManifest(String id, JSONObject installed) throws Exception {
        File file = new File(new File(new File(root, id), installed.getString("revision")), "manifest.json");
        return file.exists() ? readJson(file) : readJsonAsset("public" + installed.getString("manifest"));
    }
    synchronized JSONObject snapshot() throws Exception {
        if (index == null) throw new IOException("Missing catalogue");
        JSONObject copy = new JSONObject(index.toString());
        JSONArray entries = copy.getJSONArray("books");
        JSONArray views = copy.getJSONObject("catalogue").getJSONArray("books");
        JSONArray ready = new JSONArray();
        JSONObject readyEditions = new JSONObject();
        for (int i = 0; i < entries.length(); i++) {
            JSONObject entry = entries.getJSONObject(i);
            String id = entry.getString("id");
            JSONObject installed = pinned.get(id);
            if (installed != null) {
                JSONObject available = extendEntry(installed, entry);
                entries.put(i, available);
                readyEditions.put(id, new JSONArray(editionKeys(installed)));
                for (int n = 0; n < views.length(); n++) if (id.equals(views.getJSONObject(n).getString("id"))) views.put(n, available.getJSONObject("view"));
            }
            if (installed != null || bundled.contains(id)) ready.put(id);
        }
        // A temporarily withdrawn book can remain readable in its installed form.
        for (Map.Entry<String, JSONObject> saved : pinned.entrySet()) {
            boolean found = false;
            for (int i = 0; i < entries.length(); i++) if (saved.getKey().equals(entries.getJSONObject(i).getString("id"))) found = true;
            if (!found) {
                JSONObject entry = new JSONObject(saved.getValue().toString());
                entry.getJSONObject("view").put("discoveryAvailable", false);
                entries.put(entry); views.put(entry.getJSONObject("view")); ready.put(saved.getKey());
                readyEditions.put(saved.getKey(), new JSONArray(editionKeys(entry)));
            }
        }
        copy.put("ready", ready); copy.put("readyEditions", readyEditions);
        return copy;
    }
    JSONObject refresh() throws Exception {
        cancelled = false;
        byte[] data = request("/native-books/index.json", 8 * 1024 * 1024);
        JSONObject next = new JSONObject(new String(data, StandardCharsets.UTF_8));
        if (next.getInt("schema") != 1 || next.getJSONArray("books").length() > 2000) throw new IOException("Unsupported catalogue");
        JSONArray entries = next.getJSONArray("books");
        Set<String> ids = new HashSet<>();
        for (int i = 0; i < entries.length(); i++) {
            JSONObject entry = entries.getJSONObject(i);
            String id = entry.getString("id"), revision = entry.getString("revision");
            if (!id.matches("[a-z0-9][a-z0-9-]{0,79}") || !ids.add(id) || !revision.matches("[a-f0-9]{64}")
                || !entry.getString("manifest").equals("/native-books/" + id + "-" + revision + ".json")) throw new IOException("Invalid catalogue entry");
        }
        atomicJson(new File(root, "index.json"), next);
        index = next;
        return snapshot();
    }
    void download(String id, Progress progress) throws Exception {
        if (!id.matches("[a-z0-9][a-z0-9-]{0,79}")) throw new IOException("Invalid book");
        JSONObject installed = pinned.get(id);
        JSONObject entry = entry(id);
        Set<String> additions = editionKeys(entry);
        if (installed != null) additions.removeAll(editionKeys(installed));
        if (installed != null && additions.isEmpty()) return;
        cancelled = false;
        String revision = entry.getString("revision");
        byte[] data = request(entry.getString("manifest"), 4 * 1024 * 1024);
        if (!sha256(data).equals(revision)) throw new IOException("Publication changed; refresh the library");
        JSONObject manifest = new JSONObject(new String(data, StandardCharsets.UTF_8));
        validate(manifest, id);
        Set<String> preservedPaths = new HashSet<>();
        if (installed != null) {
            JSONObject previous = installedManifest(id, installed);
            JSONArray previousFiles = previous.getJSONArray("files"), incomingFiles = manifest.getJSONArray("files"), combined = new JSONArray();
            for (int i = 0; i < previousFiles.length(); i++) {
                JSONObject file = previousFiles.getJSONObject(i); String path = file.getString("path");
                // Bundled whole editions may replace byte-identical chapter copies.
                // Preserve only the actual installed files; the loader retains its
                // compacted-edition declaration across the addition.
                byte[] saved;
                try { saved = installedBytes(path); } catch (FileNotFoundException absentCompactedCopy) {
                    if (bundled.contains(id) && path.startsWith("/data/editions-chapters/" + id + "-")) continue;
                    throw absentCompactedCopy;
                }
                if (saved.length != file.getLong("bytes") || !sha256(saved).equals(file.getString("sha256"))) throw new IOException("An installed book needs repair");
                combined.put(file); preservedPaths.add(path);
            }
            for (int i = 0; i < incomingFiles.length(); i++) {
                JSONObject file = incomingFiles.getJSONObject(i); String path = file.getString("path");
                for (String key : additions) if (path.equals("/data/editions/" + id + "-" + key + ".json") || path.startsWith("/data/editions-chapters/" + id + "-" + key + "/")) {
                    if (!preservedPaths.contains(path)) combined.put(file);
                    break;
                }
            }
            entry = extendEntry(installed, entry);
            manifest = new JSONObject().put("schema", 1).put("book", entry.getJSONObject("book")).put("view", entry.getJSONObject("view")).put("files", combined);
            validate(manifest, id);
            revision = sha256(manifest.toString().getBytes(StandardCharsets.UTF_8));
            entry.put("revision", revision);
        }
        File dir = new File(root, id);
        dir.mkdirs();
        File staging = new File(dir, revision + ".partial");
        staging.mkdirs();
        JSONArray files = manifest.getJSONArray("files");
        long total = 0, done = 0;
        for (int i = 0; i < files.length(); i++) total += files.getJSONObject(i).getLong("bytes");
        progress.update(done, total);
        for (int i = 0; i < files.length(); i++) {
            if (cancelled) throw new IOException("Download cancelled");
            JSONObject item = files.getJSONObject(i);
            String path = item.getString("path");
            File target = new File(staging, path.substring(1));
            long expected = item.getLong("bytes");
            // A retry can reuse a verified file from an interrupted download.
            if (!target.isFile() || target.length() != expected || !sha256(fileBytes(target)).equals(item.getString("sha256"))) {
                byte[] body = preservedPaths.contains(path) ? installedBytes(path) : request(path, (int) expected);
                if (body.length != expected || !sha256(body).equals(item.getString("sha256"))) throw new IOException("Publication changed; no files were activated");
                target.getParentFile().mkdirs();
                try (FileOutputStream stream = new FileOutputStream(target)) { stream.write(body); stream.getFD().sync(); }
            }
            done += expected;
            progress.update(done, total);
        }
        atomicJson(new File(staging, "manifest.json"), manifest);
        File pack = new File(dir, revision);
        if (!pack.exists() && !staging.renameTo(pack)) throw new IOException("Could not finish download");
        // The single pointer becomes visible only after every hash passed.
        atomicJson(new File(dir, "active.json"), entry);
        activate(entry, manifest, pack);
    }
    private void activate(JSONObject entry, JSONObject manifest, File dir) throws Exception {
        JSONArray files = manifest.getJSONArray("files");
        for (int i = 0; i < files.length(); i++) {
            JSONObject item = files.getJSONObject(i);
            File file = new File(dir, item.getString("path").substring(1));
            if (!file.isFile() || file.length() != item.getLong("bytes")) throw new IOException("Incomplete saved download");
        }
        for (int i = 0; i < files.length(); i++) {
            String path = files.getJSONObject(i).getString("path");
            activeFiles.put(path, new File(dir, path.substring(1)));
        }
        pinned.put(entry.getString("id"), entry);
    }
    private static void validate(JSONObject manifest, String id) throws Exception {
        if (manifest.getInt("schema") != 1 || !id.equals(manifest.getJSONObject("book").getString("id"))
            || !id.equals(manifest.getJSONObject("view").getString("id"))) throw new IOException("Unsupported book pack");
        JSONArray files = manifest.getJSONArray("files");
        if (files.length() == 0 || files.length() > 10000) throw new IOException("Invalid pack size");
        Set<String> paths = new HashSet<>(); long bytes = 0;
        for (int i = 0; i < files.length(); i++) {
            JSONObject file = files.getJSONObject(i);
            String path = file.getString("path");
            boolean scoped = path.startsWith("/data/editions/" + id + "-")
                || path.startsWith("/data/editions-chapters/" + id + "-")
                || path.equals("/data/characters/" + id + ".v1.json")
                || path.equals("/data/onboarding/" + id + ".json")
                || path.equals("/covers/v2/" + id + ".webp")
                || path.equals("/lab/prefaces/" + id + ".json");
            long size = file.getLong("bytes");
            if (!scoped || !path.matches("/[a-zA-Z0-9/_.-]+") || path.contains("..") || !paths.add(path)
                || !file.getString("sha256").matches("[a-f0-9]{64}") || size < 0 || size > 32 * 1024 * 1024) throw new IOException("Invalid pack file");
            bytes += size;
        }
        if (bytes > 200L * 1024 * 1024) throw new IOException("Pack exceeds supported size");
    }
    private byte[] request(String path, int maximum) throws Exception {
        if (!path.startsWith("/") || path.contains("..") || path.contains("?") || path.contains("#")) throw new IOException("Invalid asset path");
        HttpURLConnection connection = (HttpURLConnection) new URL(origin + path).openConnection();
        connection.setInstanceFollowRedirects(false);
        connection.setConnectTimeout(12000); connection.setReadTimeout(30000);
        connection.setRequestProperty("Accept-Encoding", "gzip");
        try {
            if (connection.getResponseCode() != 200) throw new IOException("Download returned " + connection.getResponseCode());
            InputStream raw = connection.getInputStream();
            try (InputStream stream = "gzip".equals(connection.getContentEncoding()) ? new java.util.zip.GZIPInputStream(raw) : raw;
                 ByteArrayOutputStream result = new ByteArrayOutputStream()) {
                byte[] buffer = new byte[32768]; int count;
                while ((count = stream.read(buffer)) != -1) {
                    if (cancelled) throw new IOException("Download cancelled");
                    if ((long) result.size() + count > maximum) throw new IOException("Download exceeds its manifest");
                    result.write(buffer, 0, count);
                }
                return result.toByteArray();
            }
        } finally { connection.disconnect(); }
    }
    private static String sha256(byte[] data) throws Exception {
        StringBuilder hex = new StringBuilder();
        for (byte value : MessageDigest.getInstance("SHA-256").digest(data)) hex.append(String.format(java.util.Locale.ROOT, "%02x", value & 255));
        return hex.toString();
    }
    WebResourceResponse asset(String path) {
        File file = activeFiles.get(path);
        if (file == null) return null;
        try {
            String mime = path.endsWith(".webp") ? "image/webp" : "application/json";
            Map<String, String> headers = new HashMap<>();
            headers.put("Cache-Control", "no-cache"); headers.put("Content-Length", String.valueOf(file.length()));
            return new WebResourceResponse(mime, path.endsWith(".json") ? "UTF-8" : null, 200, "OK", headers, new FileInputStream(file));
        } catch (IOException error) { return null; }
    }
}
