import { storage } from '../storage';

// Mock AsyncStorage with factory function that preserves the module shape
jest.mock('@react-native-async-storage/async-storage', () => {
  const mockImpl = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    multiGet: jest.fn(),
    multiSet: jest.fn(),
    multiRemove: jest.fn(),
    clear: jest.fn(),
    getAllKeys: jest.fn(),
  };
  return {
    __esModule: true,
    default: mockImpl,
    ...mockImpl,
  };
});

// Import the mocked module after the mock is set up
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use the mock directly
const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getItem', () => {
    it('adds prefix to key and calls AsyncStorage', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue('test-value');

      const result = await storage.getItem('test-key');

      expect(result).toBe('test-value');
      expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith('@nscyberlab_test-key');
    });

    it('returns null on error', async () => {
      mockedAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await storage.getItem('test-key');

      expect(result).toBeNull();
    });

    it('returns null when value does not exist', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue(null);

      const result = await storage.getItem('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('setItem', () => {
    it('adds prefix to key and calls AsyncStorage', async () => {
      mockedAsyncStorage.setItem.mockResolvedValue(undefined);

      await storage.setItem('test-key', 'test-value');

      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith('@nscyberlab_test-key', 'test-value');
    });

    it('does not throw on error', async () => {
      mockedAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      await expect(storage.setItem('test-key', 'test-value')).resolves.toBeUndefined();
    });
  });

  describe('removeItem', () => {
    it('adds prefix to key and calls AsyncStorage', async () => {
      mockedAsyncStorage.removeItem.mockResolvedValue(undefined);

      await storage.removeItem('test-key');

      expect(mockedAsyncStorage.removeItem).toHaveBeenCalledWith('@nscyberlab_test-key');
    });

    it('does not throw on error', async () => {
      mockedAsyncStorage.removeItem.mockRejectedValue(new Error('Storage error'));

      await expect(storage.removeItem('test-key')).resolves.toBeUndefined();
    });
  });
});
