import {
  SupportType,
  LoadType,
  calculateReactions,
  getBeamTypeById,
  getPreset,
  getPresetKeys,
  getAllPresets,
  BEAM_TYPES,
  PRESET_SYSTEMS,
  PRESET_LABELS,
  type BeamConfig,
  type PointLoad,
  type UDLoad,
  type MomentLoad,
  type TriangularLoad,
} from '../reactionCalculator';

describe('reactionCalculator', () => {
  describe('Enums', () => {
    it('has correct SupportType values', () => {
      expect(SupportType.FIXED).toBe('FIXED');
      expect(SupportType.PINNED).toBe('PINNED');
      expect(SupportType.ROLLER).toBe('ROLLER');
      expect(SupportType.FREE).toBe('FREE');
    });

    it('has correct LoadType values', () => {
      expect(LoadType.POINT).toBe('POINT');
      expect(LoadType.UDL).toBe('UDL');
      expect(LoadType.MOMENT).toBe('MOMENT');
      expect(LoadType.TRIANGULAR).toBe('TRIANGULAR');
    });
  });

  describe('BEAM_TYPES', () => {
    it('has 4 beam types', () => {
      expect(BEAM_TYPES).toHaveLength(4);
    });

    it('includes simple beam', () => {
      const simple = BEAM_TYPES.find(bt => bt.id === 'simple');
      expect(simple).toBeDefined();
      expect(simple?.name).toBe('Basit Kiriş');
      expect(simple?.icon).toBe('⊣⊢');
    });

    it('includes cantilever beam', () => {
      const cantilever = BEAM_TYPES.find(bt => bt.id === 'cantilever');
      expect(cantilever).toBeDefined();
      expect(cantilever?.name).toBe('Konsol Kiriş');
      expect(cantilever?.icon).toBe('▬╟');
    });

    it('generates default config for simple beam', () => {
      const simple = BEAM_TYPES.find(bt => bt.id === 'simple');
      const config = simple?.defaultConfig();

      expect(config?.length).toBe(6);
      expect(config?.supports).toHaveLength(2);
      expect(config?.supports[0].type).toBe(SupportType.PINNED);
      expect(config?.supports[1].type).toBe(SupportType.ROLLER);
    });

    it('generates default config with custom length', () => {
      const simple = BEAM_TYPES.find(bt => bt.id === 'simple');
      const config = simple?.defaultConfig(10);

      expect(config?.length).toBe(10);
      expect(config?.supports[1].position).toBe(10);
    });
  });

  describe('getBeamTypeById', () => {
    it('returns beam type by id', () => {
      const result = getBeamTypeById('cantilever');
      expect(result?.id).toBe('cantilever');
    });

    it('returns undefined for unknown id', () => {
      const result = getBeamTypeById('unknown');
      expect(result).toBeUndefined();
    });
  });

  describe('PRESET_SYSTEMS', () => {
    it('has 4 preset systems', () => {
      expect(Object.keys(PRESET_SYSTEMS)).toHaveLength(4);
    });

    it('includes simply-supported-point preset', () => {
      const preset = PRESET_SYSTEMS['simply-supported-point'];
      expect(preset.length).toBe(6);
      expect(preset.loads).toHaveLength(1);
      expect(preset.loads[0].type).toBe(LoadType.POINT);
    });

    it('includes simply-supported-udl preset', () => {
      const preset = PRESET_SYSTEMS['simply-supported-udl'];
      expect(preset.length).toBe(8);
      expect(preset.loads[0].type).toBe(LoadType.UDL);
    });

    it('includes cantilever-fixed preset', () => {
      const preset = PRESET_SYSTEMS['cantilever-fixed'];
      expect(preset.length).toBe(4);
      expect(preset.supports[0].type).toBe(SupportType.FIXED);
    });
  });

  describe('PRESET_LABELS', () => {
    it('has Turkish labels for presets', () => {
      expect(PRESET_LABELS['simply-supported-point']).toBe('1. Basit Mesnetli - Nokta Yükü');
      expect(PRESET_LABELS['cantilever-fixed']).toBe('3. Konsol - Sabit Mesnet');
    });
  });

  describe('getPresetKeys', () => {
    it('returns all preset keys', () => {
      const keys = getPresetKeys();
      expect(keys).toHaveLength(4);
      expect(keys).toContain('simply-supported-point');
    });
  });

  describe('getPreset', () => {
    it('returns preset by key', () => {
      const preset = getPreset('simply-supported-point');
      expect(preset).toBeDefined();
      expect(preset?.length).toBe(6);
    });

    it('returns undefined for unknown key', () => {
      const preset = getPreset('unknown');
      expect(preset).toBeUndefined();
    });
  });

  describe('getAllPresets', () => {
    it('returns all presets with labels', () => {
      const presets = getAllPresets();

      expect(Object.keys(presets)).toHaveLength(4);
      expect(presets['simply-supported-point'].config).toBeDefined();
      expect(presets['simply-supported-point'].label).toBe('1. Basit Mesnetli - Nokta Yükü');
    });
  });

  describe('calculateReactions - Simply Supported Beam', () => {
    it('calculates reactions for point load at center', () => {
      const config: BeamConfig = {
        length: 6,
        supports: [
          { type: SupportType.PINNED, position: 0 },
          { type: SupportType.ROLLER, position: 6 },
        ],
        loads: [
          { type: LoadType.POINT, position: 3, magnitude: -10 },
        ],
      };

      const result = calculateReactions(config);

      expect(result.isValid).toBe(true);
      expect(result.reactions.size).toBe(2);

      const reactions = Array.from(result.reactions.values());
      const verticalReactions = reactions.map(r => r.vertical);

      // Each support should carry half the load (5 kN upward)
      expect(verticalReactions[0]).toBeCloseTo(5, 1);
      expect(verticalReactions[1]).toBeCloseTo(5, 1);
    });

    it('calculates reactions for off-center point load', () => {
      const config: BeamConfig = {
        length: 6,
        supports: [
          { type: SupportType.PINNED, position: 0 },
          { type: SupportType.ROLLER, position: 6 },
        ],
        loads: [
          { type: LoadType.POINT, position: 2, magnitude: -10 },
        ],
      };

      const result = calculateReactions(config);

      expect(result.isValid).toBe(true);

      const reactions = Array.from(result.reactions.values());
      // Left reaction: 10 * (6-2) / 6 = 6.67 kN
      // Right reaction: 10 * 2 / 6 = 3.33 kN
      expect(reactions[0].vertical).toBeCloseTo(6.67, 1);
      expect(reactions[1].vertical).toBeCloseTo(3.33, 1);
    });

    it('calculates reactions for UDL', () => {
      const config: BeamConfig = {
        length: 6,
        supports: [
          { type: SupportType.PINNED, position: 0 },
          { type: SupportType.ROLLER, position: 6 },
        ],
        loads: [
          { type: LoadType.UDL, startPosition: 0, endPosition: 6, magnitude: -5 },
        ],
      };

      const result = calculateReactions(config);

      expect(result.isValid).toBe(true);

      const reactions = Array.from(result.reactions.values());
      // Total load = 5 * 6 = 30 kN
      // Each support carries half = 15 kN
      expect(reactions[0].vertical).toBeCloseTo(15, 1);
      expect(reactions[1].vertical).toBeCloseTo(15, 1);
    });
  });

  describe('calculateReactions - Cantilever Beam', () => {
    it('calculates reactions for cantilever with point load at free end', () => {
      const config: BeamConfig = {
        length: 4,
        supports: [
          { type: SupportType.FIXED, position: 0 },
        ],
        loads: [
          { type: LoadType.POINT, position: 4, magnitude: -10 },
        ],
      };

      const result = calculateReactions(config);

      expect(result.isValid).toBe(true);
      expect(result.reactions.size).toBe(1);

      const reaction = result.reactions.get(0);
      expect(reaction?.vertical).toBeCloseTo(10, 1); // 10 kN upward
      expect(reaction?.moment).toBeCloseTo(40, 1); // 10 * 4 = 40 kNm counterclockwise
    });

    it('calculates reactions for cantilever with UDL', () => {
      const config: BeamConfig = {
        length: 4,
        supports: [
          { type: SupportType.FIXED, position: 0 },
        ],
        loads: [
          { type: LoadType.UDL, startPosition: 0, endPosition: 4, magnitude: -5 },
        ],
      };

      const result = calculateReactions(config);

      expect(result.isValid).toBe(true);

      const reaction = result.reactions.get(0);
      // Total load = 5 * 4 = 20 kN
      // Moment = 20 * 2 = 40 kNm (centroid at 2m from fixed end)
      expect(reaction?.vertical).toBeCloseTo(20, 1);
      expect(reaction?.moment).toBeCloseTo(40, 1);
    });
  });

  describe('calculateReactions - Fixed-Fixed Beam', () => {
    it('calculates reactions for fixed-fixed beam with center point load', () => {
      const config: BeamConfig = {
        length: 8,
        supports: [
          { type: SupportType.FIXED, position: 0 },
          { type: SupportType.FIXED, position: 8 },
        ],
        loads: [
          { type: LoadType.POINT, position: 4, magnitude: -20 },
        ],
      };

      const result = calculateReactions(config);

      expect(result.isValid).toBe(true);

      const reactions = Array.from(result.reactions.values());
      // Each support carries half the load
      expect(reactions[0].vertical).toBeCloseTo(10, 1);
      expect(reactions[1].vertical).toBeCloseTo(10, 1);

      // Fixed end moments should be present
      expect(reactions[0].moment).not.toBe(0);
      expect(reactions[1].moment).not.toBe(0);
    });
  });

  describe('calculateReactions - Error Cases', () => {
    it('returns error for unstable system', () => {
      const config: BeamConfig = {
        length: 6,
        supports: [
          { type: SupportType.ROLLER, position: 0 },
          { type: SupportType.ROLLER, position: 6 },
        ], // Two rollers = unstable (horizontal movement)
        loads: [],
      };

      const result = calculateReactions(config);

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('istikrarsız');
    });

    it('handles zero-length beam gracefully', () => {
      const config: BeamConfig = {
        length: 0,
        supports: [
          { type: SupportType.PINNED, position: 0 },
          { type: SupportType.ROLLER, position: 0 },
        ],
        loads: [],
      };

      const result = calculateReactions(config);

      // Should return some result (possibly invalid)
      expect(result).toBeDefined();
    });

    it('handles empty loads array', () => {
      const config: BeamConfig = {
        length: 6,
        supports: [
          { type: SupportType.PINNED, position: 0 },
          { type: SupportType.ROLLER, position: 6 },
        ],
        loads: [],
      };

      const result = calculateReactions(config);

      expect(result.isValid).toBe(true);
      const reactions = Array.from(result.reactions.values());
      expect(reactions[0].vertical).toBeCloseTo(0, 1);
      expect(reactions[1].vertical).toBeCloseTo(0, 1);
    });
  });

  describe('calculateReactions - Internal Forces', () => {
    it('calculates shear diagram', () => {
      const config: BeamConfig = {
        length: 6,
        supports: [
          { type: SupportType.PINNED, position: 0 },
          { type: SupportType.ROLLER, position: 6 },
        ],
        loads: [
          { type: LoadType.POINT, position: 3, magnitude: -10 },
        ],
      };

      const result = calculateReactions(config);

      expect(result.shearDiagram).toBeDefined();
      expect(result.shearDiagram.length).toBeGreaterThan(0);

      // Check points at key locations
      const atStart = result.shearDiagram.find(p => p.x === 0);
      const atLoad = result.shearDiagram.find(p => p.x === 3);
      const atEnd = result.shearDiagram.find(p => p.x === 6);

      expect(atStart?.shear).toBeCloseTo(5, 1); // Left reaction
      expect(atEnd?.shear).toBeCloseTo(-5, 1); // Right reaction (negative)
    });

    it('calculates moment diagram', () => {
      const config: BeamConfig = {
        length: 6,
        supports: [
          { type: SupportType.PINNED, position: 0 },
          { type: SupportType.ROLLER, position: 6 },
        ],
        loads: [
          { type: LoadType.POINT, position: 3, magnitude: -10 },
        ],
      };

      const result = calculateReactions(config);

      expect(result.momentDiagram).toBeDefined();
      expect(result.momentDiagram.length).toBeGreaterThan(0);

      // Max moment should be at the load point
      expect(result.maxMoment.position).toBeCloseTo(3, 1);
      expect(result.maxMoment.value).toBeCloseTo(15, 1); // 5 * 3 = 15 kNm
    });

    it('identifies max and min shear', () => {
      const config: BeamConfig = {
        length: 6,
        supports: [
          { type: SupportType.PINNED, position: 0 },
          { type: SupportType.ROLLER, position: 6 },
        ],
        loads: [
          { type: LoadType.POINT, position: 3, magnitude: -10 },
        ],
      };

      const result = calculateReactions(config);

      expect(result.maxShear.value).toBeCloseTo(5, 1);
      expect(result.maxShear.position).toBe(0);
    });

    it('identifies max moment location', () => {
      const config: BeamConfig = {
        length: 6,
        supports: [
          { type: SupportType.PINNED, position: 0 },
          { type: SupportType.ROLLER, position: 6 },
        ],
        loads: [
          { type: LoadType.POINT, position: 3, magnitude: -10 },
        ],
      };

      const result = calculateReactions(config);

      expect(result.maxMoment.value).toBeGreaterThan(0);
      expect(result.maxMoment.position).toBe(3);
    });

    it('calculates max stress', () => {
      const config: BeamConfig = {
        length: 6,
        supports: [
          { type: SupportType.PINNED, position: 0 },
          { type: SupportType.ROLLER, position: 6 },
        ],
        loads: [
          { type: LoadType.POINT, position: 3, magnitude: -10 },
        ],
        elasticModulus: 200000,
        sectionModulus: 500,
        momentOfInertia: 10000,
      };

      const result = calculateReactions(config);

      expect(result.maxStress).toBeDefined();
      expect(result.maxStress?.unit).toBe('MPa');
      expect(result.maxStress?.value).toBeGreaterThan(0);
    });

    it('calculates deflection', () => {
      const config: BeamConfig = {
        length: 6,
        supports: [
          { type: SupportType.PINNED, position: 0 },
          { type: SupportType.ROLLER, position: 6 },
        ],
        loads: [
          { type: LoadType.POINT, position: 3, magnitude: -10 },
        ],
        elasticModulus: 200000,
        sectionModulus: 500,
        momentOfInertia: 10000,
      };

      const result = calculateReactions(config);

      expect(result.deflection).toBeDefined();
      expect(result.deflection?.unit).toBe('mm');
      expect(result.deflection?.value).not.toBeNaN();
    });
  });

  describe('calculateReactions - Multiple Loads', () => {
    it('handles multiple point loads', () => {
      const config: BeamConfig = {
        length: 10,
        supports: [
          { type: SupportType.PINNED, position: 0 },
          { type: SupportType.ROLLER, position: 10 },
        ],
        loads: [
          { type: LoadType.POINT, position: 2, magnitude: -10 },
          { type: LoadType.POINT, position: 5, magnitude: -15 },
          { type: LoadType.POINT, position: 8, magnitude: -10 },
        ],
      };

      const result = calculateReactions(config);

      expect(result.isValid).toBe(true);

      const reactions = Array.from(result.reactions.values());
      const totalReaction = reactions[0].vertical + reactions[1].vertical;
      expect(totalReaction).toBeCloseTo(35, 1); // Sum of all loads
    });

    it('handles mixed load types', () => {
      const config: BeamConfig = {
        length: 10,
        supports: [
          { type: SupportType.PINNED, position: 0 },
          { type: SupportType.ROLLER, position: 10 },
        ],
        loads: [
          { type: LoadType.UDL, startPosition: 0, endPosition: 5, magnitude: -2 },
          { type: LoadType.POINT, position: 7, magnitude: -10 },
        ],
      };

      const result = calculateReactions(config);

      expect(result.isValid).toBe(true);

      // UDL: 2 * 5 = 10 kN, Point: 10 kN, Total: 20 kN
      const reactions = Array.from(result.reactions.values());
      const totalReaction = reactions[0].vertical + reactions[1].vertical;
      expect(totalReaction).toBeCloseTo(20, 1);
    });
  });

  describe('calculateReactions - Moment Loads', () => {
    it('handles applied moment', () => {
      const config: BeamConfig = {
        length: 6,
        supports: [
          { type: SupportType.PINNED, position: 0 },
          { type: SupportType.ROLLER, position: 6 },
        ],
        loads: [
          { type: LoadType.MOMENT, position: 3, magnitude: 20 },
        ],
      };

      const result = calculateReactions(config);

      expect(result.isValid).toBe(true);

      // Moment creates couple reactions
      const reactions = Array.from(result.reactions.values());
      // Reactions should be equal and opposite
      expect(reactions[0].vertical).toBeCloseTo(-reactions[1].vertical, 1);
    });
  });

  describe('calculateReactions - Triangular Load', () => {
    it('calculates reactions for triangular load', () => {
      const config: BeamConfig = {
        length: 6,
        supports: [
          { type: SupportType.PINNED, position: 0 },
          { type: SupportType.ROLLER, position: 6 },
        ],
        loads: [
          { type: LoadType.TRIANGULAR, startPosition: 0, endPosition: 6, maxMagnitude: -4 },
        ],
      };

      const result = calculateReactions(config);

      expect(result.isValid).toBe(true);

      // Total triangular load = (4 * 6) / 2 = 12 kN
      // Acting at 2/3 from start = 4m from left
      const reactions = Array.from(result.reactions.values());
      const totalReaction = reactions[0].vertical + reactions[1].vertical;
      expect(totalReaction).toBeCloseTo(12, 1);
    });
  });
});
