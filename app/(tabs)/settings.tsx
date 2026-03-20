import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useSettings } from '@/hooks/useSettings';
import { StatusIndicator } from '@/components';

export default function SettingsScreen() {
  const { settings, loading, updateSettings, testConnection } = useSettings();
  const [testing, setTesting] = useState(false);
  const [apiUrl, setApiUrl] = useState(settings?.apiUrl || '');
  const [apiKey, setApiKey] = useState(settings?.apiKey || '');
  const [autoSend, setAutoSend] = useState(settings?.autoSend ?? true);
  const [retryAttempts, setRetryAttempts] = useState(
    String(settings?.retryAttempts || 3)
  );
  const [retryDelay, setRetryDelay] = useState(
    String((settings?.retryDelay || 5000) / 1000)
  );

  const handleSave = async () => {
    await updateSettings({
      apiUrl,
      apiKey,
      autoSend,
      retryAttempts: parseInt(retryAttempts) || 3,
      retryDelay: (parseInt(retryDelay) || 5) * 1000,
    });
    Alert.alert('Success', 'Settings saved successfully!');
  };

  const handleTestConnection = async () => {
    if (!apiUrl.trim()) {
      Alert.alert('Error', 'Please enter an API URL first');
      return;
    }

    // Save URL first for testing
    await updateSettings({ apiUrl, apiKey });

    setTesting(true);
    const result = await testConnection();
    setTesting(false);

    Alert.alert(
      result.success ? 'Success' : 'Failed',
      result.message
    );
  };

  if (loading || !settings) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Device Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device Info</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Device ID</Text>
            <Text style={styles.value}>{settings.deviceId.substring(0, 8)}...</Text>
          </View>
        </View>
      </View>

      {/* API Configuration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>API Configuration</Text>
        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>API URL</Text>
            <TextInput
              style={styles.input}
              value={apiUrl}
              onChangeText={setApiUrl}
              placeholder="https://your-api.com"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>API Key (optional)</Text>
            <TextInput
              style={styles.input}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="Enter API key if required"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={styles.testButton}
            onPress={handleTestConnection}
            disabled={testing}
          >
            <Text style={styles.testButtonText}>
              {testing ? 'Testing...' : 'Test Connection'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Auto Send Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Auto Send</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Auto Send to API</Text>
              <Text style={styles.hint}>
                Automatically send caught transactions
              </Text>
            </View>
            <Switch
              value={autoSend}
              onValueChange={setAutoSend}
              trackColor={{ false: '#e5e7eb', true: '#1a1a2e' }}
              thumbColor={autoSend ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          {autoSend && (
            <>
              <View style={styles.divider} />
              <View style={styles.field}>
                <Text style={styles.label}>Retry Attempts</Text>
                <TextInput
                  style={[styles.input, styles.smallInput]}
                  value={retryAttempts}
                  onChangeText={setRetryAttempts}
                  keyboardType="number-pad"
                  placeholder="3"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Retry Delay (seconds)</Text>
                <TextInput
                  style={[styles.input, styles.smallInput]}
                  value={retryDelay}
                  onChangeText={setRetryDelay}
                  keyboardType="number-pad"
                  placeholder="5"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </>
          )}
        </View>
      </View>

      {/* Notification Permission */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Access</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Notification Permission</Text>
              <Text style={styles.hint}>
                Required to catch notifications from other apps
              </Text>
            </View>
            <StatusIndicator status="pending" text="Setup" />
          </View>
          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: '#374151' }]}
            onPress={() => {
              Alert.alert(
                'Open Settings',
                'Go to: Settings > Apps > Special access > Notification access > Enable Payment Processor',
                [{ text: 'OK' }]
              );
            }}
          >
            <Text style={styles.testButtonText}>Open Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Settings</Text>
      </TouchableOpacity>

      {/* Info */}
      <View style={styles.infoSection}>
        <Text style={styles.infoText}>
          💡 Tips:{'\n'}
          • Set up your API URL to receive transaction data{'\n'}
          • Enable notification access in Android settings{'\n'}
          • Test with the simulator on Dashboard{'\n'}
          • Check History for caught transactions
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 40,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  field: {
    marginTop: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  hint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  value: {
    fontSize: 14,
    color: '#6b7280',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    color: '#1a1a2e',
  },
  smallInput: {
    width: 100,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  testButton: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  testButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  infoText: {
    fontSize: 13,
    color: '#065f46',
    lineHeight: 20,
  },
});
