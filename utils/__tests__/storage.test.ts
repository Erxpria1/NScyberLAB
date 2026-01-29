import { storage } from '../storage';

// Mock AsyncStorage at module level
const mockGetItem = jest.fn();
const mockSetItem = jest.fn();
const mockRemoveItem = jest.fn();

jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: mockGetItem,
    setItem: mockSetItem,
    removeItem: mockRemoveItem,
  },
}));

describe('storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getItem', () => {
    it('adds prefix to key and calls AsyncStorage', async () => {
      mockGetItem.mockResolvedValue('test-value');

      const result = await storage.getItem('test-key');

      expect(result).toBe('test-value');
      expect(mockGetItem).toHaveBeenCalledWith('@nscyberlab_test-key');
    });

    it('returns null on error', async () => {
      mockGetItem.mockRejectedValue(new Error('Storage error'));

      const result = await storage.getItem('test-key');

      expect(result).toBeNull();
    });

    it('returns null when value does not exist', async () => {
      mockGetItem.mockResolvedValue(null);

      const result = await storage.getItem('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('setItem', () => {
    it('adds prefix to key and calls AsyncStorage', async () => {
      mockSetItem.mockResolvedValue(undefined);

      await storage.setItem('test-key', 'test-value');

      expect(mockSetItem).toHaveBeenCalledWith('@nscyberlab_test-key', 'test-value');
    });

    it('does not throw on error', async () => {
      mockSetItem.mockRejectedValue(new Error('Storage error'));

      await expect(storage.setItem('test-key', 'test-value')).resolves.toBeUndefined();
    });
  });

  describe('removeItem', () => {
    it('adds prefix to key and calls AsyncStorage', async () => {
      mockRemoveItem.mockResolvedValue(undefined);

      await storage.removeItem('test-key');

      expect(mockRemoveItem).toHaveBeenCalledWith('@nscyberlab_test-key');
    });

    it('does not throw on error', async () => {
      mockRemoveItem.mockRejectedValue(new Error('Storage error'));

      await expect(storage.removeItem('test-key')).resolves.toBeUndefined();
    });
  });
});
