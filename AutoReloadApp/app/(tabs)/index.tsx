import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const { NativeModules } = require('react-native');
const AutoReloadModule = NativeModules.AutoReloadModule;

export default function HomeScreen() {
  const [hasOverlayPermission, setHasOverlayPermission] = useState(false);
  const [hasAccessibilityPermission, setHasAccessibilityPermission] = useState(false);
  const [isServiceRunning, setIsServiceRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const overlayPerm = await AutoReloadModule?.checkOverlayPermission();
      const accessPerm = await AutoReloadModule?.isAccessibilityServiceEnabled();
      setHasOverlayPermission(overlayPerm || false);
      setHasAccessibilityPermission(accessPerm || false);
    } catch (error) {
      console.log('Error checking permissions:', error);
    } finally {
      setIsLoading(false);
      await SplashScreen.hideAsync();
    }
  };

  const requestOverlayPermission = async () => {
    await AutoReloadModule?.requestOverlayPermission();
    Alert.alert(
      'Permission Required',
      'Please enable "Display over other apps" permission, then come back and tap "Verify".',
      [
        { text: 'OK', onPress: () => setTimeout(checkPermissions, 2000) },
      ]
    );
  };

  const openAccessibilitySettings = async () => {
    await AutoReloadModule?.openAccessibilitySettings();
    Alert.alert(
      'Enable Accessibility Service',
      'Please find "AutoReload" in accessibility services and enable it, then come back and tap "Verify".',
      [
        { text: 'OK', onPress: () => setTimeout(checkPermissions, 2000) },
      ]
    );
  };

  const startService = async () => {
    try {
      await AutoReloadModule?.startFloatingService();
      setIsServiceRunning(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to start service');
    }
  };

  const stopService = async () => {
    try {
      await AutoReloadModule?.stopFloatingService();
      setIsServiceRunning(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to stop service');
    }
  };

  const openChrome = async () => {
    const url = 'https://www.google.com';
    await AutoReloadModule?.openChrome(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>AR</Text>
            </View>
          </View>
          <Text style={styles.appName}>AutoReload</Text>
          <Text style={styles.tagline}>Auto-refresh web pages automatically</Text>
        </View>

        {/* Permissions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Permissions</Text>

          <View style={styles.permissionItem}>
            <View style={styles.permissionInfo}>
              <Text style={styles.permissionTitle}>Overlay Permission</Text>
              <Text style={styles.permissionDesc}>Required for floating button</Text>
            </View>
            {hasOverlayPermission ? (
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>Granted</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.grantButton} onPress={requestOverlayPermission}>
                <Text style={styles.grantButtonText}>Grant</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.permissionItem}>
            <View style={styles.permissionInfo}>
              <Text style={styles.permissionTitle}>Accessibility Service</Text>
              <Text style={styles.permissionDesc}>Required for auto-reload in Chrome</Text>
            </View>
            {hasAccessibilityPermission ? (
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>Enabled</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.grantButton} onPress={openAccessibilitySettings}>
                <Text style={styles.grantButtonText}>Enable</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Controls Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Controls</Text>

          <View style={styles.controlItem}>
            <View style={styles.controlInfo}>
              <Text style={styles.controlTitle}>Floating Button</Text>
              <Text style={styles.controlDesc}>
                {isServiceRunning ? 'Service is running' : 'Service is stopped'}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.controlButton,
                isServiceRunning ? styles.stopButton : styles.startButton,
              ]}
              onPress={isServiceRunning ? stopService : startService}
              disabled={!hasOverlayPermission || !hasAccessibilityPermission}
            >
              <Text style={styles.controlButtonText}>
                {isServiceRunning ? 'Stop' : 'Start'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* How to Use Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Use</Text>
          <View style={styles.stepList}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>Grant all required permissions above</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>Tap "Start" to activate floating button</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>Open Chrome with any website</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <Text style={styles.stepText}>Tap floating button "START" to begin auto-reload</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>5</Text>
              </View>
              <Text style={styles.stepText}>Tap "STOP" on floating button to stop reloading</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity style={styles.chromeButton} onPress={openChrome}>
            <Text style={styles.chromeButtonText}>Open Chrome</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Page reloads every 2 seconds when active
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#FF5722',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: '#94a3b8',
  },
  section: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  permissionInfo: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#f1f5f9',
    marginBottom: 4,
  },
  permissionDesc: {
    fontSize: 12,
    color: '#94a3b8',
  },
  grantButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  grantButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  statusBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 12,
  },
  controlItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  controlInfo: {
    flex: 1,
  },
  controlTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#f1f5f9',
    marginBottom: 4,
  },
  controlDesc: {
    fontSize: 12,
    color: '#94a3b8',
  },
  controlButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#22c55e',
  },
  stopButton: {
    backgroundColor: '#ef4444',
  },
  controlButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  stepList: {
    gap: 12,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF5722',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
  },
  chromeButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  chromeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
  },
});
