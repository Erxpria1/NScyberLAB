import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CommandHistory, SystemStatus } from '@/types';
import { storage } from '@/utils/storage';

export type ActiveScreen = 'terminal' | 'reaction' | 'beam' | 'truss' | 'section' | 'material' | 'loads' | 'calc' | '3d' | 'pdf' | 'support';

export const AVAILABLE_TABS = ['PDF', 'CYBERHOME', 'REACTION', 'BEAM', 'TRUSS', 'SECTION', 'MATERIAL', 'LOADS', 'CALC', '3D'] as const;

interface TerminalState {
  commandHistory: CommandHistory[];
  currentInput: string;
  status: SystemStatus;
  isBooting: boolean;

  // Control Tower state
  controlTowerVisible: boolean;
  availableTabs: readonly string[];
  activeTabIndex: number;

  // Screen navigation
  activeScreen: ActiveScreen;

  addCommand: (command: string, output?: string) => void;
  setInput: (input: string) => void;
  clearHistory: () => void;
  setBooting: (booting: boolean) => void;
  updateStatus: (updates: Partial<SystemStatus>) => void;

  // Control Tower actions
  toggleControlTower: () => void;
  setControlTowerVisible: (visible: boolean) => void;
  navigateTabUp: () => void;
  navigateTabDown: () => void;
  navigateTabLeft: () => void;
  navigateTabRight: () => void;
  selectActiveTab: () => string;

  // Screen navigation actions
  setActiveScreen: (screen: ActiveScreen) => void;
  returnToTerminal: () => void;
}

export const useTerminalStore = create<TerminalState>()(
  persist(
    (set, get) => ({
      commandHistory: [],
      currentInput: '',
      status: {
        memory: 75,
        battery: 100,
        connection: 'ONLINE',
        mode: 'IDLE',
      },
      isBooting: true,

      // Control Tower initial state
      controlTowerVisible: false,
      availableTabs: AVAILABLE_TABS,
      activeTabIndex: 0,

      // Screen navigation initial state
      activeScreen: 'terminal',

      addCommand: (command, output) =>
        set((state) => ({
          commandHistory: [
            ...state.commandHistory,
            {
              id: Date.now().toString(),
              command,
              output,
              timestamp: new Date(),
            },
          ],
          currentInput: '',
        })),

      setInput: (input) => set({ currentInput: input }),

      clearHistory: () => set({ commandHistory: [] }),

      setBooting: (booting) => set({ isBooting: booting }),

      updateStatus: (updates) =>
        set((state) => ({
          status: { ...state.status, ...updates },
        })),

      // Control Tower actions
      toggleControlTower: () =>
        set((state) => {
          const newState = !state.controlTowerVisible;
          return {
            controlTowerVisible: newState,
            commandHistory: newState
              ? [
                  ...state.commandHistory,
                  {
                    id: Date.now().toString(),
                    command: '',
                    output: '>> CONTROL TOWER ACTIVE\n>> Use arrow keys to navigate, ENTER to select',
                    timestamp: new Date(),
                  },
                ]
              : state.commandHistory,
          };
        }),

      setControlTowerVisible: (visible) => set({ controlTowerVisible: visible }),

      navigateTabUp: () =>
        set((state) => {
          const newIndex = (state.activeTabIndex - 1 + state.availableTabs.length) % state.availableTabs.length;
          return {
            activeTabIndex: newIndex,
          };
        }),

      navigateTabDown: () =>
        set((state) => {
          const newIndex = (state.activeTabIndex + 1) % state.availableTabs.length;
          return {
            activeTabIndex: newIndex,
          };
        }),

      navigateTabLeft: () =>
        set((state) => {
          const newIndex = (state.activeTabIndex - 1 + state.availableTabs.length) % state.availableTabs.length;
          return {
            activeTabIndex: newIndex,
          };
        }),

      navigateTabRight: () =>
        set((state) => {
          const newIndex = (state.activeTabIndex + 1) % state.availableTabs.length;
          return {
            activeTabIndex: newIndex,
          };
        }),

      selectActiveTab: () => {
        const state = get();
        const tab = state.availableTabs[state.activeTabIndex];
        set({ controlTowerVisible: false, activeTabIndex: 0 });
        return tab || '';
      },

      // Screen navigation actions
      setActiveScreen: (screen) => set({ activeScreen: screen }),

      returnToTerminal: () => set({ activeScreen: 'terminal' }),
    }),
    {
      name: 'terminal-storage',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        commandHistory: state.commandHistory.slice(-50), // Keep last 50 commands
        activeScreen: state.activeScreen,
      }),
    }
  )
);
