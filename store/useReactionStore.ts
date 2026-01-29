import { create } from 'zustand';
import type {
  BeamConfig,
  Load,
  Support,
  AnalysisResults,
  SupportType,
  LoadType,
} from '@/utils/structural/reactionCalculator';
import {
  calculateReactions,
  PRESET_SYSTEMS,
  PRESET_LABELS,
  getAllPresets,
} from '@/utils/structural/reactionCalculator';

interface ReactionState {
  // Current beam configuration
  beamLength: number;
  supports: Support[];
  loads: Load[];

  // Analysis results
  results: AnalysisResults | null;

  // UI state
  selectedPreset: string | null;
  showResults: boolean;

  // Actions
  setBeamLength: (length: number) => void;
  addSupport: (support: Support) => void;
  removeSupport: (index: number) => void;
  clearSupports: () => void;
  addLoad: (load: Load) => void;
  removeLoad: (index: number) => void;
  updateLoad: (index: number, load: Load) => void;
  clearLoads: () => void;
  calculate: () => void;
  loadPreset: (presetKey: string) => void;
  reset: () => void;
  setShowResults: (show: boolean) => void;
}

const DEFAULT_SUPPORTS: Support[] = [
  { type: 'PINNED' as SupportType, position: 0 },
  { type: 'ROLLER' as SupportType, position: 6 },
];

export const useReactionStore = create<ReactionState>((set, get) => ({
  beamLength: 6,
  supports: DEFAULT_SUPPORTS,
  loads: [],
  results: null,
  selectedPreset: null,
  showResults: false,

  setBeamLength: (length) => set({ beamLength: length, results: null }),

  addSupport: (support) =>
    set((state) => ({
      supports: [...state.supports, support].sort((a, b) => a.position - b.position),
      results: null,
    })),

  removeSupport: (index) =>
    set((state) => ({
      supports: state.supports.filter((_, i) => i !== index),
      results: null,
    })),

  clearSupports: () => set({ supports: [], results: null }),

  addLoad: (load) =>
    set((state) => ({
      loads: [...state.loads, load].sort((a, b) => {
        const posA = 'position' in a ? a.position : a.startPosition;
        const posB = 'position' in b ? b.position : b.startPosition;
        return posA - posB;
      }),
      results: null,
    })),

  removeLoad: (index) =>
    set((state) => ({
      loads: state.loads.filter((_, i) => i !== index),
      results: null,
    })),

  updateLoad: (index, load) =>
    set((state) => {
      const newLoads = [...state.loads];
      newLoads[index] = load;
      return { loads: newLoads, results: null };
    }),

  clearLoads: () => set({ loads: [], results: null }),

  calculate: () => {
    const state = get();
    const config: BeamConfig = {
      length: state.beamLength,
      supports: state.supports,
      loads: state.loads,
    };
    const results = calculateReactions(config);
    set({ results, showResults: true });
  },

  loadPreset: (presetKey) => {
    const preset = PRESET_SYSTEMS[presetKey];
    if (preset) {
      set({
        beamLength: preset.length,
        supports: preset.supports,
        loads: preset.loads,
        selectedPreset: presetKey,
        results: null,
        showResults: false,
      });
    }
  },

  reset: () =>
    set({
      beamLength: 6,
      supports: DEFAULT_SUPPORTS,
      loads: [],
      results: null,
      selectedPreset: null,
      showResults: false,
    }),

  setShowResults: (show) => set({ showResults: show }),
}));

export const getPresetOptions = () => getAllPresets();
