import { renderHook, act } from '@testing-library/react-native';
import { useReactionStore } from '../useReactionStore';
import { SupportType, LoadType } from '@/utils/structural/reactionCalculator';

// Mock AsyncStorage using the official mock
jest.mock('@react-native-async-storage/async-storage',
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock storage
jest.mock('@/utils/storage', () => ({
  storage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

// Mock reaction calculator - preserve enum exports
const mockCalculateReactions = jest.fn(() => ({
  reactions: [
    { force: 5, position: 0, type: 'PINNED' },
    { force: 5, position: 6, type: 'ROLLER' },
  ],
  shearDiagram: [{ x: 0, shear: 5 }, { x: 6, shear: -5 }],
  momentDiagram: [{ x: 0, moment: 0 }, { x: 3, moment: 7.5 }, { x: 6, moment: 0 }],
  maxShear: { value: 5, position: 0 },
  minShear: { value: -5, position: 6 },
  maxMoment: { value: 7.5, position: 3 },
  minMoment: { value: 0, position: 0 },
  maxDeflection: { value: 0, position: 0 },
}));

jest.mock('@/utils/structural/reactionCalculator', () => {
  const actualModule = jest.requireActual('@/utils/structural/reactionCalculator');
  return {
    ...actualModule,
    calculateReactions: jest.fn(() => mockCalculateReactions()),
    getAllPresets: jest.fn(() => actualModule.getAllPresets?.() || {}),
    getBeamTypeById: jest.fn((id: string) => actualModule.getBeamTypeById(id)),
  };
});

describe('useReactionStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useReactionStore.getState().reset();
  });

  describe('initial state', () => {
    it('has correct default values', () => {
      const { result } = renderHook(() => useReactionStore());

      expect(result.current.beamLength).toBe(6);
      expect(result.current.supports).toHaveLength(2);
      expect(result.current.loads).toEqual([]);
      expect(result.current.results).toBeNull();
      expect(result.current.showResults).toBe(false);
      expect(result.current.selectedPreset).toBeNull();
    });

    it('has default supports', () => {
      const { result } = renderHook(() => useReactionStore());

      expect(result.current.supports[0]).toEqual({ type: 'PINNED', position: 0 });
      expect(result.current.supports[1]).toEqual({ type: 'ROLLER', position: 6 });
    });
  });

  describe('setBeamLength', () => {
    it('updates beam length and clears results', () => {
      const { result } = renderHook(() => useReactionStore());

      act(() => {
        result.current.setBeamLength(10);
      });

      expect(result.current.beamLength).toBe(10);
      expect(result.current.results).toBeNull();
    });
  });

  describe('addSupport', () => {
    it('adds support sorted by position', () => {
      const { result } = renderHook(() => useReactionStore());

      act(() => {
        result.current.addSupport({ type: SupportType.PINNED, position: 3 });
      });

      expect(result.current.supports).toHaveLength(3);
      expect(result.current.supports[1].position).toBe(3);
    });

    it('clears results when adding support', () => {
      const { result } = renderHook(() => useReactionStore());

      act(() => {
        result.current.calculate();
        result.current.addSupport({ type: SupportType.ROLLER, position: 4 });
      });

      expect(result.current.results).toBeNull();
    });
  });

  describe('removeSupport', () => {
    it('removes support by index', () => {
      const { result } = renderHook(() => useReactionStore());

      act(() => {
        result.current.removeSupport(0);
      });

      expect(result.current.supports).toHaveLength(1);
      expect(result.current.supports[0].type).toBe('ROLLER');
    });
  });

  describe('clearSupports', () => {
    it('removes all supports', () => {
      const { result } = renderHook(() => useReactionStore());

      act(() => {
        result.current.clearSupports();
      });

      expect(result.current.supports).toEqual([]);
    });
  });

  describe('addLoad', () => {
    it('adds load sorted by position', () => {
      const { result } = renderHook(() => useReactionStore());

      act(() => {
        result.current.addLoad({ type: LoadType.POINT, position: 5, magnitude: 10 });
        result.current.addLoad({ type: LoadType.POINT, position: 2, magnitude: 5 });
      });

      expect(result.current.loads).toHaveLength(2);
      expect(result.current.loads[0]).toEqual({ type: LoadType.POINT, position: 2, magnitude: 5 });
      expect(result.current.loads[1]).toEqual({ type: LoadType.POINT, position: 5, magnitude: 10 });
    });
  });

  describe('updateLoad', () => {
    it('updates load at index', () => {
      const { result } = renderHook(() => useReactionStore());

      act(() => {
        result.current.addLoad({ type: LoadType.POINT, position: 3, magnitude: 10 });
        result.current.updateLoad(0, { type: LoadType.POINT, position: 3, magnitude: 20 });
      });

      expect(result.current.loads[0]).toEqual({ type: LoadType.POINT, position: 3, magnitude: 20 });
    });
  });

  describe('clearLoads', () => {
    it('removes all loads', () => {
      const { result } = renderHook(() => useReactionStore());

      act(() => {
        result.current.addLoad({ type: LoadType.POINT, position: 3, magnitude: 10 });
        result.current.clearLoads();
      });

      expect(result.current.loads).toEqual([]);
    });
  });

  describe('calculate', () => {
    it('calculates and shows results', () => {
      const { result } = renderHook(() => useReactionStore());

      act(() => {
        result.current.calculate();
      });

      expect(result.current.results).not.toBeNull();
      expect(result.current.showResults).toBe(true);
    });
  });

  describe('loadPreset', () => {
    it('loads preset configuration', () => {
      const { result } = renderHook(() => useReactionStore());

      act(() => {
        result.current.loadPreset('simply-supported-point');
      });

      expect(result.current.beamLength).toBe(6);
      expect(result.current.loads).toHaveLength(1);
      expect(result.current.selectedPreset).toBe('simply-supported-point');
      expect(result.current.showResults).toBe(true);
    });
  });

  describe('loadBeamType', () => {
    it('loads beam type configuration', () => {
      const { result } = renderHook(() => useReactionStore());

      act(() => {
        result.current.loadBeamType('simple');
      });

      expect(result.current.beamLength).toBe(6);
      expect(result.current.selectedPreset).toBe('simple');
      expect(result.current.showResults).toBe(false);
    });

    it('accepts custom length', () => {
      const { result } = renderHook(() => useReactionStore());

      act(() => {
        result.current.loadBeamType('simple', 12);
      });

      expect(result.current.beamLength).toBe(12);
    });
  });

  describe('reset', () => {
    it('resets to default state', () => {
      const { result } = renderHook(() => useReactionStore());

      act(() => {
        result.current.setBeamLength(10);
        result.current.addLoad({ type: LoadType.POINT, position: 3, magnitude: 10 });
        result.current.calculate();
        result.current.reset();
      });

      expect(result.current.beamLength).toBe(6);
      expect(result.current.loads).toEqual([]);
      expect(result.current.results).toBeNull();
      expect(result.current.selectedPreset).toBeNull();
    });
  });

  describe('setShowResults', () => {
    it('toggles results visibility', () => {
      const { result } = renderHook(() => useReactionStore());

      act(() => {
        result.current.setShowResults(true);
      });

      expect(result.current.showResults).toBe(true);

      act(() => {
        result.current.setShowResults(false);
      });

      expect(result.current.showResults).toBe(false);
    });
  });
});
