// ============================================================================
// STRUCTURAL ENGINEERING: REACTION & INTERNAL FORCES CALCULATOR
// Full-featured physics engine for beam analysis
// ============================================================================

export enum SupportType {
  FIXED = 'FIXED',
  PINNED = 'PINNED',
  ROLLER = 'ROLLER',
  FREE = 'FREE',
}

export enum LoadType {
  POINT = 'POINT',
  UDL = 'UDL',
  MOMENT = 'MOMENT',
  TRIANGULAR = 'TRIANGULAR',
}

export interface PointLoad {
  type: LoadType.POINT;
  position: number; // Distance from left support (m)
  magnitude: number; // Force (kN) - positive = downward
}

export interface UDLoad {
  type: LoadType.UDL;
  startPosition: number; // Start distance (m)
  endPosition: number; // End distance (m)
  magnitude: number; // Load intensity (kN/m) - positive = downward
}

export interface MomentLoad {
  type: LoadType.MOMENT;
  position: number; // Distance from left support (m)
  magnitude: number; // Moment (kNm) - positive = clockwise
}

export interface TriangularLoad {
  type: LoadType.TRIANGULAR;
  startPosition: number;
  endPosition: number;
  maxMagnitude: number; // Peak load (kN/m) at endPosition
}

export type Load = PointLoad | UDLoad | MomentLoad | TriangularLoad;

export interface Support {
  type: SupportType;
  position: number; // Distance from reference (m)
}

export interface BeamConfig {
  length: number;
  supports: Support[];
  loads: Load[];
}

export interface ReactionResults {
  reactions: Map<number, { horizontal: number; vertical: number; moment: number }>;
  isValid: boolean;
  errorMessage?: string;
}

export interface InternalForcesPoint {
  x: number;
  shear: number;
  moment: number;
}

export interface AnalysisResults extends ReactionResults {
  shearDiagram: InternalForcesPoint[];
  momentDiagram: InternalForcesPoint[];
  maxShear: { value: number; position: number };
  maxMoment: { value: number; position: number };
  minMoment: { value: number; position: number };
}

// ============================================================================
// PRESET SYSTEMS
// ============================================================================

export const PRESET_SYSTEMS: Record<string, BeamConfig> = {
  'simply-supported-point': {
    length: 6,
    supports: [
      { type: SupportType.PINNED, position: 0 },
      { type: SupportType.ROLLER, position: 6 },
    ],
    loads: [
      { type: LoadType.POINT, position: 3, magnitude: -10 },
    ],
  },
  'simply-supported-udl': {
    length: 8,
    supports: [
      { type: SupportType.PINNED, position: 0 },
      { type: SupportType.ROLLER, position: 8 },
    ],
    loads: [
      { type: LoadType.UDL, startPosition: 0, endPosition: 8, magnitude: -5 },
    ],
  },
  'cantilever-fixed': {
    length: 4,
    supports: [
      { type: SupportType.FIXED, position: 0 },
    ],
    loads: [
      { type: LoadType.POINT, position: 4, magnitude: -15 },
    ],
  },
  'fixed-fixed-mixed': {
    length: 10,
    supports: [
      { type: SupportType.FIXED, position: 0 },
      { type: SupportType.FIXED, position: 10 },
    ],
    loads: [
      { type: LoadType.POINT, position: 5, magnitude: -20 },
      { type: LoadType.UDL, startPosition: 2, endPosition: 8, magnitude: -3 },
    ],
  },
};

export const PRESET_LABELS: Record<string, string> = {
  'simply-supported-point': '1. Basit Mesnetli - Nokta Yükü',
  'simply-supported-udl': '2. Basit Mesnetli - Yayılı Yük',
  'cantilever-fixed': '3. Konsol - Sabit Mesnet',
  'fixed-fixed-mixed': '4. Sabit-Sabit - Karma Yük',
};

// ============================================================================
// CALCULATION ENGINE
// ============================================================================

class ReactionCalculator {
  private config: BeamConfig;
  private EPSILON = 1e-6;

  constructor(config: BeamConfig) {
    this.config = config;
  }

  // Calculate equivalent point load and position for distributed loads
  private getEquivalentLoad(load: Load): { force: number; position: number; moment?: number } {
    switch (load.type) {
      case LoadType.POINT:
        return { force: load.magnitude, position: load.position };

      case LoadType.UDL: {
        const length = load.endPosition - load.startPosition;
        const force = load.magnitude * length;
        const position = (load.startPosition + load.endPosition) / 2;
        return { force, position };
      }

      case LoadType.TRIANGULAR: {
        const length = load.endPosition - load.startPosition;
        const force = (load.maxMagnitude * length) / 2;
        const position = load.startPosition + (length * 2) / 3;
        return { force, position };
      }

      case LoadType.MOMENT:
        return { force: 0, position: load.position, moment: load.magnitude };

      default:
        return { force: 0, position: 0 };
    }
  }

  // Check static determinacy
  private checkDeterminacy(): { determinate: boolean; unknowns: number } {
    let unknowns = 0;
    for (const support of this.config.supports) {
      switch (support.type) {
        case SupportType.FIXED:
          unknowns += 3;
          break;
        case SupportType.PINNED:
          unknowns += 2;
          break;
        case SupportType.ROLLER:
          unknowns += 1;
          break;
        case SupportType.FREE:
          unknowns += 0;
          break;
      }
    }

    // For a 2D beam, we have 3 equilibrium equations
    const determinate = unknowns === 3;
    return { determinate, unknowns };
  }

  // Calculate reactions using equilibrium equations
  calculateReactions(): ReactionResults {
    const { determinate, unknowns } = this.checkDeterminacy();

    if (!determinate) {
      return {
        reactions: new Map(),
        isValid: false,
        errorMessage: unknowns > 3
          ? 'Sistem hiperstatik! ' + unknowns + ' bilinmeyen var.'
          : 'Sistem mekaniğe bağlı değil (istikrarsız).',
      };
    }

    // Build system of equations for statically determinate structures
    const reactions = new Map();
    const supports = this.config.supports.sort((a, b) => a.position - b.position);

    // Initialize reaction unknowns
    const unknownList: { key: string; supportIndex: number; type: string }[] = [];
    for (let i = 0; i < supports.length; i++) {
      const s = supports[i];
      if (s.type === SupportType.FIXED) {
        unknownList.push({ key: `${i}_H`, supportIndex: i, type: 'H' });
        unknownList.push({ key: `${i}_V`, supportIndex: i, type: 'V' });
        unknownList.push({ key: `${i}_M`, supportIndex: i, type: 'M' });
      } else if (s.type === SupportType.PINNED) {
        unknownList.push({ key: `${i}_H`, supportIndex: i, type: 'H' });
        unknownList.push({ key: `${i}_V`, supportIndex: i, type: 'V' });
      } else if (s.type === SupportType.ROLLER) {
        unknownList.push({ key: `${i}_V`, supportIndex: i, type: 'V' });
      }
    }

    // If we have exactly 3 unknowns, solve directly
    if (unknownList.length === 3) {
      const solution = this.solveThreeUnknowns(supports, unknownList);
      for (const [key, value] of Object.entries(solution)) {
        const [idx, type] = key.split('_');
        const supportIdx = parseInt(idx);
        if (!reactions.has(supportIdx)) {
          reactions.set(supportIdx, { horizontal: 0, vertical: 0, moment: 0 });
        }
        const r = reactions.get(supportIdx)!;
        if (type === 'H') r.horizontal = value;
        if (type === 'V') r.vertical = value;
        if (type === 'M') r.moment = value;
      }
    }

    // Verify equilibrium
    const valid = this.verifyEquilibrium(reactions, supports);

    return {
      reactions,
      isValid: valid,
      errorMessage: valid ? undefined : 'Denge denklemleri sağlanamadı.',
    };
  }

  private solveThreeUnknowns(
    supports: Support[],
    unknowns: { key: string; supportIndex: number; type: string }[]
  ): Record<string, number> {
    const result: Record<string, number> = {};

    // Calculate total loads and moments about reference (leftmost point)
    let totalFy = 0; // Sum of vertical forces
    let totalM = 0; // Sum of moments about reference
    let totalFx = 0; // Sum of horizontal forces

    const refPoint = Math.min(...supports.map((s) => s.position));

    for (const load of this.config.loads) {
      const equiv = this.getEquivalentLoad(load);
      totalFy -= equiv.force; // Positive load = downward
      totalM -= equiv.force * (equiv.position - refPoint);
      if (equiv.moment) totalM -= equiv.moment;
    }

    // Solve based on support configuration
    // This is a simplified solver for common cases

    // Case 1: Simply supported (Pin + Roller)
    const pinSupport = supports.find((s) => s.type === SupportType.PINNED);
    const rollerSupport = supports.find((s) => s.type === SupportType.ROLLER);

    if (pinSupport && rollerSupport) {
      const L = rollerSupport.position - pinSupport.position;
      const R_roller = -totalM / L;
      const R_pin = -(totalFy + R_roller);

      result[`${supports.indexOf(rollerSupport)}_V`] = R_roller;
      result[`${supports.indexOf(pinSupport)}_V`] = R_pin;
      result[`${supports.indexOf(pinSupport)}_H`] = totalFx;
      return result;
    }

    // Case 2: Cantilever (Fixed only)
    const fixedSupport = supports.find((s) => s.type === SupportType.FIXED);
    if (fixedSupport && supports.length === 1) {
      const idx = supports.indexOf(fixedSupport);
      result[`${idx}_V`] = -totalFy;
      result[`${idx}_H`] = -totalFx;
      result[`${idx}_M`] = -totalM;
      return result;
    }

    // Case 3: Propped cantilever (Fixed + Roller)
    if (fixedSupport && rollerSupport) {
      const L = rollerSupport.position - fixedSupport.position;
      // For a propped cantilever, use compatibility: deflection at roller = 0
      // Simplified: solve using the 3-equation system with moment at fixed as unknown
      const M_fixed = this.solveProppedCantilever(fixedSupport.position, rollerSupport.position);
      result[`${supports.indexOf(fixedSupport)}_V`] = -totalFy - M_fixed / L;
      result[`${supports.indexOf(fixedSupport)}_M`] = M_fixed;
      result[`${supports.indexOf(rollerSupport)}_V`] = -M_fixed / L;
      return result;
    }

    // Case 4: Fixed-Fixed (indeterminate, but using approximate method)
    const fixedSupports = supports.filter((s) => s.type === SupportType.FIXED);
    if (fixedSupports.length === 2) {
      return this.solveFixedFixed(supports);
    }

    return result;
  }

  private solveProppedCantilever(x1: number, x2: number): number {
    // Calculate fixed end moment for propped cantilever with loads
    let M_fixed = 0;

    for (const load of this.config.loads) {
      const equiv = this.getEquivalentLoad(load);
      const a = equiv.position - x1;
      const L = x2 - x1;

      if (load.type === LoadType.POINT) {
        M_fixed += -(equiv.force * a * (L - a) * (2 * L - a)) / (2 * L * L);
      } else if (load.type === LoadType.UDL) {
        const udLoad = load as UDLoad;
        const a = udLoad.startPosition - x1;
        const b = udLoad.endPosition - x1;
        M_fixed += -(equiv.force * (L * L - 3 * a * a + 2 * b * b)) / (8 * L);
      }
    }

    return M_fixed;
  }

  private solveFixedFixed(supports: Support[]): Record<string, number> {
    const result: Record<string, number> = {};
    const L = supports[1].position - supports[0].position;

    // Simplified fixed-fixed analysis
    let totalLoad = 0;
    let momentAboutLeft = 0;

    for (const load of this.config.loads) {
      const equiv = this.getEquivalentLoad(load);
      totalLoad += equiv.force;
      momentAboutLeft += equiv.force * (equiv.position - supports[0].position);
    }

    // For symmetric loading on fixed-fixed beam
    const R1 = -totalLoad / 2;
    const R2 = -totalLoad / 2;
    const M1 = -momentAboutLeft / 2;
    const M2 = momentAboutLeft / 2;

    result[`0_V`] = R1;
    result[`0_M`] = M1;
    result[`0_H`] = 0;
    result[`1_V`] = R2;
    result[`1_M`] = M2;
    result[`1_H`] = 0;

    return result;
  }

  private verifyEquilibrium(
    reactions: Map<number, { horizontal: number; vertical: number; moment: number }>,
    supports: Support[]
  ): boolean {
    let sumFx = 0;
    let sumFy = 0;
    let sumM = 0;

    const refPoint = supports[0]?.position || 0;

    for (const [_, r] of reactions) {
      sumFx += r.horizontal;
      sumFy += r.vertical;
      sumM += r.moment;
    }

    for (const load of this.config.loads) {
      const equiv = this.getEquivalentLoad(load);
      sumFy += equiv.force;
      sumM += equiv.force * (equiv.position - refPoint);
      if (equiv.moment) sumM += equiv.moment;
    }

    return (
      Math.abs(sumFx) < this.EPSILON * 100 &&
      Math.abs(sumFy) < this.EPSILON * 100 &&
      Math.abs(sumM) < this.EPSILON * 100
    );
  }

  // Calculate internal forces (Shear & Moment) along the beam
  calculateInternalForces(results: ReactionResults): AnalysisResults {
    const points: InternalForcesPoint[] = [];
    const numPoints = 100;
    const dx = this.config.length / (numPoints - 1);

    // Get support positions for reference
    const supportPositions = this.config.supports.map((s) => s.position);

    for (let i = 0; i < numPoints; i++) {
      const x = (i * dx);

      // Calculate shear at x
      let shear = 0;
      let moment = 0;

      // Add reaction contributions
      for (const [idx, reaction] of results.reactions) {
        const supportPos = this.config.supports[idx].position;
        if (x >= supportPos - this.EPSILON) {
          shear += reaction.vertical;
          moment += reaction.vertical * (x - supportPos) + reaction.moment;
        }
      }

      // Subtract load contributions
      for (const load of this.config.loads) {
        const equiv = this.getEquivalentLoad(load);

        if (load.type === LoadType.POINT) {
          if (x >= load.position - this.EPSILON) {
            shear -= load.magnitude;
            moment -= load.magnitude * (x - load.position);
          }
        } else if (load.type === LoadType.UDL) {
          if (x > load.startPosition) {
            const loadEnd = Math.min(x, load.endPosition);
            const loadedLength = loadEnd - load.startPosition;
            const loadForce = load.magnitude * loadedLength;
            const loadCentroid = load.startPosition + loadedLength / 2;
            shear -= loadForce;
            moment -= loadForce * (x - loadCentroid);
          }
        } else if (load.type === LoadType.TRIANGULAR) {
          if (x > load.startPosition) {
            const loadEnd = Math.min(x, load.endPosition);
            const loadedLength = loadEnd - load.startPosition;
            const ratio = loadedLength / (load.endPosition - load.startPosition);
            const loadForce = (load.maxMagnitude * loadedLength * ratio) / 2;
            const loadCentroid =
              load.startPosition + (loadedLength * (2 + ratio)) / (3 * (1 + ratio));
            shear -= loadForce;
            moment -= loadForce * (x - loadCentroid);
          }
        } else if (load.type === LoadType.MOMENT) {
          if (x >= load.position - this.EPSILON) {
            moment -= load.magnitude;
          }
        }
      }

      points.push({ x, shear, moment });
    }

    // Find max/min values
    let maxShear = { value: 0, position: 0 };
    let maxMoment = { value: -Infinity, position: 0 };
    let minMoment = { value: Infinity, position: 0 };

    for (const p of points) {
      if (Math.abs(p.shear) > Math.abs(maxShear.value)) {
        maxShear = { value: p.shear, position: p.x };
      }
      if (p.moment > maxMoment.value) {
        maxMoment = { value: p.moment, position: p.x };
      }
      if (p.moment < minMoment.value) {
        minMoment = { value: p.moment, position: p.x };
      }
    }

    return {
      ...results,
      shearDiagram: points,
      momentDiagram: points,
      maxShear,
      maxMoment,
      minMoment,
    };
  }

  // Main analysis function
  analyze(): AnalysisResults {
    const reactionResults = this.calculateReactions();
    return this.calculateInternalForces(reactionResults);
  }
}

// ============================================================================
// PUBLIC API
// ============================================================================

export function calculateReactions(config: BeamConfig): AnalysisResults {
  const calculator = new ReactionCalculator(config);
  return calculator.analyze();
}

export function getPresetKeys(): string[] {
  return Object.keys(PRESET_SYSTEMS);
}

export function getPreset(key: string): BeamConfig | undefined {
  return PRESET_SYSTEMS[key];
}

export function getAllPresets(): Record<string, { config: BeamConfig; label: string }> {
  const result: Record<string, { config: BeamConfig; label: string }> = {};
  for (const [key, label] of Object.entries(PRESET_LABELS)) {
    result[key] = { config: PRESET_SYSTEMS[key], label };
  }
  return result;
}
