package app.tinct.reader;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.media.AudioAttributes;
import android.media.MediaMetadata;
import android.media.session.MediaSession;
import android.media.session.PlaybackState;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;
import java.lang.ref.WeakReference;
import java.util.ArrayList;

/** Foreground lifetime and media controls for the shared reader's audio element. */
public class NativeNarrationService extends Service {
    private static final String CHANNEL = "tinct_narration";
    private static final int NOTICE = 231;
    private static NativeNarrationService current;
    private static WeakReference<NativeMediaSessionPlugin> owner = new WeakReference<>(null);
    private static final ArrayList<PluginCall> starting = new ArrayList<>();
    private static JSObject state = new JSObject();
    private MediaSession session;
    private PowerManager.WakeLock wakeLock;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private boolean foreground;
    private final Runnable renew = new Runnable() {
        @Override public void run() {
            if (!foreground) return;
            if (wakeLock.isHeld()) wakeLock.release();
            wakeLock.acquire(10 * 60_000L);
            handler.postDelayed(this, 5 * 60_000L);
        }
    };

    static void prepare(NativeMediaSessionPlugin plugin, PluginCall call) {
        owner = new WeakReference<>(plugin);
        state = call.getData();
        starting.add(call);
    }
    static void failStart() { starting.clear(); }
    static void update(JSObject next) {
        state = next;
        if (current != null) current.publish();
    }
    @Override public void onCreate() {
        super.onCreate();
        current = this;
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel channel = new NotificationChannel(CHANNEL, "Reading aloud", NotificationManager.IMPORTANCE_LOW);
            channel.setSound(null, null);
            getSystemService(NotificationManager.class).createNotificationChannel(channel);
        }
        wakeLock = ((PowerManager)getSystemService(POWER_SERVICE)).newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "Tinct:Narration");
        wakeLock.setReferenceCounted(false);
        session = new MediaSession(this, "TinctNarration");
        session.setFlags(MediaSession.FLAG_HANDLES_MEDIA_BUTTONS | MediaSession.FLAG_HANDLES_TRANSPORT_CONTROLS);
        session.setPlaybackToLocal(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build());
        session.setCallback(new MediaSession.Callback() {
            @Override public void onPlay() { action("play", null); }
            @Override public void onPause() { action("pause", null); }
            @Override public void onStop() { action("pause", null); stopSelf(); }
            @Override public void onSeekTo(long position) { action("seekto", position); }
            @Override public void onRewind() { action("seekbackward", null); }
            @Override public void onFastForward() { action("seekforward", null); }
        }, handler);
        session.setActive(true);
    }
    @Override public int onStartCommand(Intent intent, int flags, int startId) {
        // start() is called only from the reader's play intent or a media control.
        promote();
        if (intent != null && intent.getAction() != null) action(intent.getAction(), null);
        publish();
        for (PluginCall call : new ArrayList<>(starting)) call.resolve();
        starting.clear();
        return START_NOT_STICKY;
    }
    private void action(String action, Long position) {
        NativeMediaSessionPlugin plugin = owner.get();
        if (plugin == null) { stopSelf(); return; }
        if ("play".equals(action)) promote();
        plugin.action(action, position);
    }
    private boolean playing() { return "playing".equals(state.optString("playbackState")); }
    private PendingIntent command(String action, int id) {
        return PendingIntent.getService(this, id, new Intent(this, NativeNarrationService.class).setAction(action),
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }
    private Notification notification() {
        Intent open = new Intent(this, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent content = PendingIntent.getActivity(this, 0, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(this, CHANNEL) : new Notification.Builder(this);
        return b.setSmallIcon(android.R.drawable.ic_media_play)
            .setContentTitle(state.optString("title", "Tinct"))
            .setContentText(state.optString("artist", ""))
            .setContentIntent(content).setOnlyAlertOnce(true).setShowWhen(false)
            .setVisibility(Notification.VISIBILITY_PUBLIC).setCategory(Notification.CATEGORY_TRANSPORT)
            .setOngoing(playing())
            .addAction(new Notification.Action.Builder(android.R.drawable.ic_media_rew, "Back 15 seconds", command("seekbackward", 1)).build())
            .addAction(new Notification.Action.Builder(playing() ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play,
                playing() ? "Pause" : "Play", command(playing() ? "pause" : "play", 2)).build())
            .addAction(new Notification.Action.Builder(android.R.drawable.ic_media_ff, "Forward 30 seconds", command("seekforward", 3)).build())
            .setStyle(new Notification.MediaStyle().setMediaSession(session.getSessionToken()).setShowActionsInCompactView(0, 1, 2)).build();
    }
    private void promote() {
        if (Build.VERSION.SDK_INT >= 29) startForeground(NOTICE, notification(), ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        else startForeground(NOTICE, notification());
        if (!foreground) {
            foreground = true;
            renew.run();
        }
    }
    private void publish() {
        long actions = PlaybackState.ACTION_PLAY | PlaybackState.ACTION_PAUSE | PlaybackState.ACTION_PLAY_PAUSE
            | PlaybackState.ACTION_STOP | PlaybackState.ACTION_SEEK_TO | PlaybackState.ACTION_REWIND | PlaybackState.ACTION_FAST_FORWARD;
        session.setMetadata(new MediaMetadata.Builder()
            .putString(MediaMetadata.METADATA_KEY_TITLE, state.optString("title", "Tinct"))
            .putString(MediaMetadata.METADATA_KEY_ARTIST, state.optString("artist", ""))
            .putString(MediaMetadata.METADATA_KEY_ALBUM, state.optString("album", ""))
            .putLong(MediaMetadata.METADATA_KEY_DURATION, (long)(state.optDouble("duration", 0) * 1000)).build());
        session.setPlaybackState(new PlaybackState.Builder().setActions(actions)
            .setState(playing() ? PlaybackState.STATE_PLAYING : PlaybackState.STATE_PAUSED,
                (long)(state.optDouble("position", 0) * 1000), playing() ? (float)state.optDouble("playbackRate", 1) : 0).build());
        getSystemService(NotificationManager.class).notify(NOTICE, notification());
        if (!playing() && foreground) {
            foreground = false;
            handler.removeCallbacks(renew);
            if (wakeLock.isHeld()) wakeLock.release();
            stopForeground(false);
        }
    }
    @Override public void onTaskRemoved(Intent rootIntent) {
        action("pause", null);
        stopSelf();
    }
    @Override public void onDestroy() {
        current = null;
        foreground = false;
        handler.removeCallbacksAndMessages(null);
        if (wakeLock != null && wakeLock.isHeld()) wakeLock.release();
        if (session != null) { session.setActive(false); session.release(); }
        for (PluginCall call : new ArrayList<>(starting)) call.reject("Android playback was stopped.");
        starting.clear();
        owner.clear();
        stopForeground(true);
        getSystemService(NotificationManager.class).cancel(NOTICE);
        super.onDestroy();
    }
    @Override public IBinder onBind(Intent intent) { return null; }
}
