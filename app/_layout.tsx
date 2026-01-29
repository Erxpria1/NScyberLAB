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
        name="beam"
        options={{
          presentation: 'modal',
          animation: 'fade',
        }}
      />
      <Stack.Screen
        name="truss"
        options={{
          presentation: 'modal',
          animation: 'fade',
        }}
      />
    </Stack>
    </SafeAreaProvider>
  );
}
