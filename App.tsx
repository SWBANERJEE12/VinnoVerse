import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MotionProvider } from './src/lib/motion-context';
import { AppProvider } from './src/lib/store';
import { SettingsProvider } from './src/lib/settings';
import { ThemeProvider } from './src/lib/theme-context';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <AppProvider>
            <ThemeProvider>
              <MotionProvider>
                <View style={styles.app}>
                  <StatusBar style="auto" />
                  <RootNavigator />
                </View>
              </MotionProvider>
            </ThemeProvider>
          </AppProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, width: '100%' },
});
