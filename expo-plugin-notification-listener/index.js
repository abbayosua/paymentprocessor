const { withAndroidManifest, withAppBuildGradle, AndroidConfig } = require('expo/config-plugins');

const { getMainApplicationOrThrow } = AndroidConfig.Manifest;

/**
 * Expo Config Plugin for Android Notification Listener Service
 */
const withNotificationListener = (config, props = {}) => {
  const serviceClassName =
    props.serviceClassName || 'com.paymentprocessor.notificationlistener.NotificationListener';

  // Add necessary permissions and service to AndroidManifest.xml
  config = withAndroidManifest(config, (config) => {
    const mainApplication = getMainApplicationOrThrow(config.modResults);

    // Add the notification listener service
    const service = {
      $: {
        'android:name': serviceClassName,
        'android:permission': 'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE',
        'android:exported': 'true',
      },
      'intent-filter': [
        {
          action: [
            {
              $: {
                'android:name': 'android.service.notification.NotificationListenerService',
              },
            },
          ],
        },
      ],
    };

    // Check if service already exists
    if (!mainApplication.service) {
      mainApplication.service = [];
    }

    const existingServiceIndex = mainApplication.service.findIndex(
      (s) => s.$['android:name'] === serviceClassName
    );

    if (existingServiceIndex === -1) {
      mainApplication.service.push(service);
    }

    return config;
  });

  // Add dependencies to build.gradle
  config = withAppBuildGradle(config, (config) => {
    const contents = config.modResults.contents;

    // Check if the dependency already exists
    if (!contents.includes('androidx.core:core')) {
      const dependenciesMatch = contents.match(/dependencies\s*\{/);
      if (dependenciesMatch) {
        const insertIndex = contents.indexOf(dependenciesMatch[0]) + dependenciesMatch[0].length;
        config.modResults.contents =
          contents.slice(0, insertIndex) +
          "\n    implementation 'androidx.core:core:1.12.0'" +
          contents.slice(insertIndex);
      }
    }

    return config;
  });

  return config;
};

module.exports = withNotificationListener;
