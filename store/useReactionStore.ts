import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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
  getAllPresets,
  getBeamTypeById,
} from '@/utils/structural/reactionCalculator';
import { storage } from '@/utils/storage';

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
  loadBeamType: (typeId: string, length?: number) => void;
  reset: () => void;
  setShowResults: (show: boolean) => void;
}

const DEFAULT_SUPPORTS: Support[] = [
  { type: 'PINNED' as SupportType, position: 0 },
  { type: 'ROLLER' as SupportType, position: 6 },
];

export const useReactionStore = create<ReactionState>()(
  persist(
    (set, get) => ({
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
          const config: BeamConfig = {
            length: preset.length,
            supports: preset.supports,
            loads: preset.loads,
          };
          const results = calculateReactions(config);
          set({
            beamLength: preset.length,
            supports: preset.supports,
            loads: preset.loads,
            selectedPreset: presetKey,
            results,
            showResults: true,
          });
        }
      },

      loadBeamType: (typeId, length) => {
        const beamType = getBeamTypeById(typeId);
        if (beamType) {
          const config = beamType.defaultConfig(length);
          set({
            beamLength: config.length,
            supports: config.supports,
            loads: config.loads,
            selectedPreset: typeId,
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
    }),
    {
      name: 'reaction-storage',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        beamLength: state.beamLength,
        supports: state.supports,
        loads: state.loads,
        selectedPreset: state.selectedPreset,
      }),
    }
  )
);

export const getPresetOptions = () => getAllPresets();
