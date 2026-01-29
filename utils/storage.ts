import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_PREFIX = '@nscyberlab_';

export const storage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(STORAGE_PREFIX + key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_PREFIX + key, value);
    } catch {
      // Silent fail
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(STORAGE_PREFIX + key);
    } catch {
      // Silent fail
    }
  },
};
