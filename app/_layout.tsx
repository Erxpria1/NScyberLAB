import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTerminalStore } from '@/store/useTerminalStore';

export default function RootLayout() {
  const isBooting = useTerminalStore((s) => s.isBooting);

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000' },
          orientation: 'portrait',
        }}
      >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="library"
        options={{
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="pdf-reader"
        options={{
          presentation: 'card',
          animation: 'fade',
        }}
      />
      <Stack.Screen
        name="note-editor"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack>
  </SafeAreaProvider>
);
}
