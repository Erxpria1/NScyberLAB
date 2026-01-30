import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/utils/storage';

type ThemeMode = 'cyber' | 'retro';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  isRetroMode: boolean;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'cyber',
      setMode: (mode) => set({ mode }),
      toggleMode: () =>
        set((state) => ({
          mode: state.mode === 'cyber' ? 'retro' : 'cyber',
        })),
      isRetroMode: false,
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => storage),
    }
  )
);

// Selector hook for retro mode
export const useIsRetroMode = () => {
  const mode = useThemeStore((state) => state.mode);
  return mode === 'retro';
};
