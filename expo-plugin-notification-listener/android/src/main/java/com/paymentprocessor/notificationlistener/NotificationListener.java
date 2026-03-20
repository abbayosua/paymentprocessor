package com.paymentprocessor.notificationlistener;

import android.app.Notification;
import android.content.Intent;
import android.os.Bundle;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Android Notification Listener Service
 * Listens to notifications from all apps and forwards them to React Native
 */
public class NotificationListener extends NotificationListenerService {

    private static final String TAG = "NotificationListener";
    private static NotificationListener instance;

    public static NotificationListener getInstance() {
        return instance;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        instance = this;
        Log.d(TAG, "NotificationListener service created");
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        instance = null;
        Log.d(TAG, "NotificationListener service destroyed");
    }

    @Override
    public void onListenerConnected() {
        super.onListenerConnected();
        Log.d(TAG, "NotificationListener connected");

        // Notify React Native that listener is connected
        sendEventToJS("onListenerConnected", null);
    }

    @Override
    public void onListenerDisconnected() {
        super.onListenerDisconnected();
        Log.d(TAG, "NotificationListener disconnected");

        // Notify React Native that listener is disconnected
        sendEventToJS("onListenerDisconnected", null);
    }

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        try {
            String packageName = sbn.getPackageName();
            Notification notification = sbn.getNotification();

            if (notification == null) {
                return;
            }

            // Extract notification data
            Bundle extras = notification.extras;

            String title = "";
            String text = "";
            String bigText = "";

            // Get title
            if (extras.containsKey(Notification.EXTRA_TITLE)) {
                title = extras.getString(Notification.EXTRA_TITLE, "");
            }

            // Get text
            if (extras.containsKey(Notification.EXTRA_TEXT)) {
                text = extras.getString(Notification.EXTRA_TEXT, "");
            }

            // Get big text (for expanded notifications)
            if (extras.containsKey(Notification.EXTRA_BIG_TEXT)) {
                bigText = extras.getString(Notification.EXTRA_BIG_TEXT, "");
            }

            // Use big text if available, otherwise use regular text
            String messageText = !bigText.isEmpty() ? bigText : text;

            // Create JSON object with notification data
            JSONObject notificationData = new JSONObject();
            notificationData.put("packageName", packageName);
            notificationData.put("title", title);
            notificationData.put("text", messageText);
            notificationData.put("timestamp", System.currentTimeMillis());
            notificationData.put("id", sbn.getId());
            notificationData.put("tag", sbn.getTag() != null ? sbn.getTag() : "");

            Log.d(TAG, "Notification received from: " + packageName);
            Log.d(TAG, "Title: " + title);
            Log.d(TAG, "Text: " + messageText);

            // Send to React Native
            sendEventToJS("onNotificationReceived", notificationData);

        } catch (Exception e) {
            Log.e(TAG, "Error processing notification: " + e.getMessage(), e);
        }
    }

    @Override
    public void onNotificationRemoved(StatusBarNotification sbn) {
        // Notification was removed - we might not need this
        Log.d(TAG, "Notification removed from: " + sbn.getPackageName());
    }

    /**
     * Check if notification listener is enabled
     */
    public static boolean isNotificationListenerEnabled() {
        return instance != null;
    }

    /**
     * Send event to React Native through the module
     */
    private void sendEventToJS(String eventName, JSONObject data) {
        if (NotificationListenerModule.getInstance() != null) {
            NotificationListenerModule.getInstance().sendEvent(eventName, data);
        }
    }
}
