import { useEffect, useState } from 'react';
import { useBatteryLevel } from 'expo-battery';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface DeviceStatus {
  battery: number;      // 0-100
  memory: number;       // 0-100 (simulated)
  connection: string;   // 'ONLINE' | 'OFFLINE' | 'WIFI' | 'CELLULAR'
}

/**
 * Real-time device status hook for the terminal HUD.
 * - Battery: Uses expo-battery for actual device battery level
 * - Network: Uses NetInfo for connection type detection
 * - Memory: Simulated with slight fluctuation for "cyber" aesthetic
 */
export function useDeviceStatus(): DeviceStatus {
  const batteryLevel = useBatteryLevel();
  const [connection, setConnection] = useState<string>('KONTROL...');
  const [memory, setMemory] = useState<number>(75);

  // Network status subscription
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      if (!state.isConnected) {
        setConnection('OFFLINE');
      } else if (state.type === 'wifi') {
        setConnection('WIFI');
      } else if (state.type === 'cellular') {
        setConnection('HÜCRESEL');
      } else {
        setConnection('ONLINE');
      }
    });
    return () => unsubscribe();
  }, []);

  // Simulated memory fluctuation (for "cyber" aesthetic)
  useEffect(() => {
    const interval = setInterval(() => {
      setMemory((prev) => {
        const fluctuation = Math.random() * 4 - 2; // +/- 2%
        return Math.max(50, Math.min(95, prev + fluctuation));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return {
    battery: batteryLevel !== null ? Math.round(batteryLevel * 100) : 100,
    memory: Math.round(memory),
    connection,
  };
}
