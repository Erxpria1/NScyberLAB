import { renderHook, act } from '@testing-library/react-native';
import { useTerminalStore } from '../useTerminalStore';

// Mock AsyncStorage using the official mock
jest.mock('@react-native-async-storage/async-storage',
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock storage to return null (no saved state)
jest.mock('@/utils/storage', () => ({
  storage: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
  },
}));

describe('useTerminalStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useTerminalStore.getState().clearHistory();
    useTerminalStore.setState({
      isBooting: true,
      controlTowerVisible: false,
      activeTabIndex: 0,
      activeScreen: 'terminal',
    });
  });

  describe('initial state', () => {
    it('has correct default values', () => {
      const { result } = renderHook(() => useTerminalStore());

      expect(result.current.commandHistory).toEqual([]);
      expect(result.current.currentInput).toBe('');
      expect(result.current.isBooting).toBe(true);
      expect(result.current.controlTowerVisible).toBe(false);
      expect(result.current.activeScreen).toBe('terminal');
    });

    it('has correct system status', () => {
      const { result } = renderHook(() => useTerminalStore());

      expect(result.current.status).toEqual({
        memory: 75,
        battery: 100,
        connection: 'ONLINE',
        mode: 'IDLE',
      });
    });
  });

  describe('addCommand', () => {
    it('adds command to history', () => {
      const { result } = renderHook(() => useTerminalStore());

      act(() => {
        result.current.addCommand('HELP', '>> AVAILABLE COMMANDS');
      });

      expect(result.current.commandHistory).toHaveLength(1);
      expect(result.current.commandHistory[0].command).toBe('HELP');
      expect(result.current.commandHistory[0].output).toBe('>> AVAILABLE COMMANDS');
    });

    it('clears current input after adding command', () => {
      const { result } = renderHook(() => useTerminalStore());

      act(() => {
        result.current.setInput('test');
        result.current.addCommand('test', 'output');
      });

      expect(result.current.currentInput).toBe('');
    });

    it('generates unique IDs for commands', async () => {
      const { result } = renderHook(() => useTerminalStore());

      act(() => {
        result.current.addCommand('cmd1');
      });

      // Small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 2));

      act(() => {
        result.current.addCommand('cmd2');
      });

      expect(result.current.commandHistory[0].id).not.toBe(result.current.commandHistory[1].id);
    });
  });

  describe('clearHistory', () => {
    it('clears all commands', () => {
      const { result } = renderHook(() => useTerminalStore());

      act(() => {
        result.current.addCommand('cmd1');
        result.current.addCommand('cmd2');
        result.current.clearHistory();
      });

      expect(result.current.commandHistory).toEqual([]);
    });
  });

  describe('setInput', () => {
    it('updates current input', () => {
      const { result } = renderHook(() => useTerminalStore());

      act(() => {
        result.current.setInput('test command');
      });

      expect(result.current.currentInput).toBe('test command');
    });
  });

  describe('setBooting', () => {
    it('changes booting state', () => {
      const { result } = renderHook(() => useTerminalStore());

      act(() => {
        result.current.setBooting(false);
      });

      expect(result.current.isBooting).toBe(false);
    });
  });

  describe('updateStatus', () => {
    it('updates status values', () => {
      const { result } = renderHook(() => useTerminalStore());

      act(() => {
        result.current.updateStatus({ memory: 50, battery: 80 });
      });

      expect(result.current.status.memory).toBe(50);
      expect(result.current.status.battery).toBe(80);
      expect(result.current.status.connection).toBe('ONLINE'); // Unchanged
    });
  });

  describe('Control Tower', () => {
    it('toggles visibility', () => {
      const { result } = renderHook(() => useTerminalStore());

      expect(result.current.controlTowerVisible).toBe(false);

      act(() => {
        result.current.toggleControlTower();
      });

      expect(result.current.controlTowerVisible).toBe(true);

      act(() => {
        result.current.toggleControlTower();
      });

      expect(result.current.controlTowerVisible).toBe(false);
    });

    it('adds message when opening Control Tower', () => {
      const { result } = renderHook(() => useTerminalStore());

      act(() => {
        result.current.toggleControlTower();
      });

      const lastCommand = result.current.commandHistory[result.current.commandHistory.length - 1];
      expect(lastCommand.output).toContain('CONTROL TOWER ACTIVE');
    });

    it('navigates tabs correctly', () => {
      const { result } = renderHook(() => useTerminalStore());

      expect(result.current.activeTabIndex).toBe(0);

      act(() => {
        result.current.navigateTabDown();
      });

      expect(result.current.activeTabIndex).toBe(1);

      act(() => {
        result.current.navigateTabUp();
      });

      expect(result.current.activeTabIndex).toBe(0);
    });

    it('wraps around tab navigation', () => {
      const { result } = renderHook(() => useTerminalStore());
      const tabCount = result.current.availableTabs.length;

      act(() => {
        result.current.setControlTowerVisible(true);
        result.current.navigateTabUp(); // Should go to last tab
      });

      expect(result.current.activeTabIndex).toBe(tabCount - 1);
    });

    it('selects active tab and closes tower', () => {
      const { result } = renderHook(() => useTerminalStore());

      act(() => {
        result.current.setControlTowerVisible(true);
        result.current.navigateTabDown();
      });

      // Verify tower is open and tab index changed
      expect(result.current.controlTowerVisible).toBe(true);
      expect(result.current.activeTabIndex).toBe(1);

      act(() => {
        result.current.selectActiveTab();
      });

      // After selectActiveTab, tower should close and index reset
      expect(result.current.controlTowerVisible).toBe(false);
      expect(result.current.activeTabIndex).toBe(0);
    });
  });

  describe('Screen navigation', () => {
    it('changes active screen', () => {
      const { result } = renderHook(() => useTerminalStore());

      act(() => {
        result.current.setActiveScreen('reaction');
      });

      expect(result.current.activeScreen).toBe('reaction');

      act(() => {
        result.current.returnToTerminal();
      });

      expect(result.current.activeScreen).toBe('terminal');
    });
  });
});
