package com.paymentprocessor.notificationlistener;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.provider.Settings;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * React Native Module for Notification Listener
 * Provides JavaScript interface to the native notification listener service
 */
public class NotificationListenerModule extends ReactContextBaseJavaModule {

    private static final String TAG = "NotificationListenerModule";
    private static NotificationListenerModule instance;
    private final ReactApplicationContext reactContext;

    public NotificationListenerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        instance = this;
    }

    public static NotificationListenerModule getInstance() {
        return instance;
    }

    @NonNull
    @Override
    public String getName() {
        return "NotificationListener";
    }

    /**
     * Check if notification listener permission is granted
     */
    @ReactMethod
    public void hasPermission(Promise promise) {
        try {
            String packageName = reactContext.getPackageName();
            String flat = Settings.Secure.getString(
                reactContext.getContentResolver(),
                "enabled_notification_listeners"
            );

            boolean enabled = flat != null && flat.contains(packageName);
            promise.resolve(enabled);
        } catch (Exception e) {
            Log.e(TAG, "Error checking permission: " + e.getMessage(), e);
            promise.reject("PERMISSION_CHECK_ERROR", e.getMessage());
        }
    }

    /**
     * Open notification listener settings
     * This is required because the user must manually enable notification access
     */
    @ReactMethod
    public void openSettings(Promise promise) {
        try {
            Intent intent = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            reactContext.startActivity(intent);
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error opening settings: " + e.getMessage(), e);
            promise.reject("OPEN_SETTINGS_ERROR", e.getMessage());
        }
    }

    /**
     * Check if the listener service is running
     */
    @ReactMethod
    public void isListenerConnected(Promise promise) {
        try {
            boolean connected = NotificationListener.isNotificationListenerEnabled();
            promise.resolve(connected);
        } catch (Exception e) {
            Log.e(TAG, "Error checking listener: " + e.getMessage(), e);
            promise.reject("LISTENER_CHECK_ERROR", e.getMessage());
        }
    }

    /**
     * Get list of packages that we can listen to
     * Returns all packages that have posted notifications recently
     */
    @ReactMethod
    public void getActiveNotifications(Promise promise) {
        try {
            NotificationListener listener = NotificationListener.getInstance();
            if (listener == null) {
                promise.reject("LISTENER_NOT_CONNECTED", "Notification listener is not connected");
                return;
            }

            android.service.notification.StatusBarNotification[] notifications = listener.getActiveNotifications();

            WritableMap result = Arguments.createMap();
            result.putInt("count", notifications != null ? notifications.length : 0);

            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error getting active notifications: " + e.getMessage(), e);
            promise.reject("GET_NOTIFICATIONS_ERROR", e.getMessage());
        }
    }

    /**
     * Send event to JavaScript
     * Called from NotificationListener service
     */
    public void sendEvent(String eventName, JSONObject data) {
        try {
            WritableMap params = Arguments.createMap();

            if (data != null) {
                params.putString("packageName", data.optString("packageName", ""));
                params.putString("title", data.optString("title", ""));
                params.putString("text", data.optString("text", ""));
                params.putDouble("timestamp", data.optDouble("timestamp", 0));
                params.putInt("id", data.optInt("id", 0));
                params.putString("tag", data.optString("tag", ""));
            }

            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);

            Log.d(TAG, "Event sent to JS: " + eventName);
        } catch (Exception e) {
            Log.e(TAG, "Error sending event to JS: " + e.getMessage(), e);
        }
    }
}
