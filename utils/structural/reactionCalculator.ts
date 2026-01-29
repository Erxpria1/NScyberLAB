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
  position: number; // Distance from left end (m)
  magnitude: number; // Force (kN) - negative = downward
}

export interface UDLoad {
  type: LoadType.UDL;
  startPosition: number; // Start distance from left end (m)
  endPosition: number; // End distance from left end (m)
  magnitude: number; // Load intensity (kN/m) - negative = downward
}

export interface MomentLoad {
  type: LoadType.MOMENT;
  position: number; // Distance from left end (m)
  magnitude: number; // Moment (kNm) - positive = clockwise
}

export interface TriangularLoad {
  type: LoadType.TRIANGULAR;
  startPosition: number; // Start distance from left end (m)
  endPosition: number; // End distance from left end (m)
  maxMagnitude: number; // Peak load (kN/m) at endPosition - negative = downward
}

export type Load = PointLoad | UDLoad | MomentLoad | TriangularLoad;

export interface Support {
  type: SupportType;
  position: number; // Distance from left end (m)
}

export interface BeamConfig {
  length: number;
  supports: Support[];
  loads: Load[];
}

export interface ReactionForce {
  horizontal: number; // kN, positive = right
  vertical: number; // kN, positive = up
  moment: number; // kNm, positive = counterclockwise
}

export interface ReactionResults {
  reactions: Map<number, ReactionForce>;
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
  private readonly EPSILON = 1e-9;

  constructor(config: BeamConfig) {
    this.config = config;
  }

  // Get sorted supports with their original indices
  private getSortedSupportsWithOriginalIndices(): Array<{ support: Support; originalIndex: number }> {
    return this.config.supports
      .map((support, originalIndex) => ({ support, originalIndex }))
      .sort((a, b) => a.support.position - b.support.position);
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
        // Centroid of triangle from start
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
          ? `Sistem hiperstatik! ${unknowns} bilinmeyen var (3 olmalı).`
          : 'Sistem mekaniğe bağlı değil (istikrarsız - yetersiz mesnet).',
      };
    }

    // Get sorted supports with original indices
    const sortedSupports = this.getSortedSupportsWithOriginalIndices();

    // Build reaction map using ORIGINAL indices
    const reactions = new Map<number, ReactionForce>();
    for (const { originalIndex } of sortedSupports) {
      reactions.set(originalIndex, { horizontal: 0, vertical: 0, moment: 0 });
    }

    // Calculate total loads about leftmost point (x=0 reference)
    let totalFy = 0; // Sum of vertical forces (downward positive for loads)
    let totalM = 0; // Sum of moments about x=0
    let totalFx = 0; // Sum of horizontal forces

    for (const load of this.config.loads) {
      const equiv = this.getEquivalentLoad(load);
      totalFy += equiv.force; // Load magnitude is negative for downward
      totalM += equiv.force * equiv.position; // M = F * d
      if (equiv.moment) totalM += equiv.moment;
    }

    // Solve based on support configuration
    const supports = sortedSupports.map(s => s.support);

    // Case 1: Simply supported (Pin + Roller)
    const pinIdx = sortedSupports.findIndex(s => s.support.type === SupportType.PINNED);
    const rollerIdx = sortedSupports.findIndex(s => s.support.type === SupportType.ROLLER);

    if (pinIdx >= 0 && rollerIdx >= 0) {
      const pinSupport = supports[pinIdx];
      const rollerSupport = supports[rollerIdx];
      const pinOriginalIdx = sortedSupports[pinIdx].originalIndex;
      const rollerOriginalIdx = sortedSupports[rollerIdx].originalIndex;

      const L = rollerSupport.position - pinSupport.position;

      // Moment equilibrium about pin support
      // ΣM_pin = 0: R_roller * L + Σ(M_loads_about_pin) = 0
      let momentAboutPin = 0;
      for (const load of this.config.loads) {
        const equiv = this.getEquivalentLoad(load);
        const distFromPin = equiv.position - pinSupport.position;
        momentAboutPin += equiv.force * distFromPin;
        if (equiv.moment) momentAboutPin += equiv.moment;
      }

      const R_roller = -momentAboutPin / L;
      const R_pin = -(totalFy + R_roller);

      reactions.get(rollerOriginalIdx)!.vertical = R_roller;
      reactions.get(pinOriginalIdx)!.vertical = R_pin;
      reactions.get(pinOriginalIdx)!.horizontal = 0; // No horizontal loads

      return {
        reactions,
        isValid: this.verifyEquilibrium(reactions),
      };
    }

    // Case 2: Cantilever (Fixed only)
    if (supports.length === 1 && supports[0].type === SupportType.FIXED) {
      const originalIdx = sortedSupports[0].originalIndex;
      const supportPos = supports[0].position;

      // Calculate forces and moments about the fixed support
      let Fy = 0;
      let M = 0;

      for (const load of this.config.loads) {
        const equiv = this.getEquivalentLoad(load);
        Fy += equiv.force;
        const distFromSupport = equiv.position - supportPos;
        M += equiv.force * distFromSupport;
        if (equiv.moment) M += equiv.moment;
      }

      // Reactions oppose the loads
      reactions.get(originalIdx)!.vertical = -Fy;
      reactions.get(originalIdx)!.horizontal = 0;
      reactions.get(originalIdx)!.moment = -M;

      return {
        reactions,
        isValid: this.verifyEquilibrium(reactions),
      };
    }

    // Case 3: Propped cantilever (Fixed + Roller) - hyperstatik, yaklaşık çözüm
    const fixedIdx = sortedSupports.findIndex(s => s.support.type === SupportType.FIXED);
    if (fixedIdx >= 0 && rollerIdx >= 0) {
      // This requires compatibility equation - using simplified approach
      const fixedSupport = supports[fixedIdx];
      const rollerSupport = supports[rollerIdx];
      const fixedOriginalIdx = sortedSupports[fixedIdx].originalIndex;
      const rollerOriginalIdx = sortedSupports[rollerIdx].originalIndex;

      const L = rollerSupport.position - fixedSupport.position;

      // Approximate: Treat as simply supported with moment at fixed end
      let momentAboutFixed = 0;
      for (const load of this.config.loads) {
        const equiv = this.getEquivalentLoad(load);
        const distFromFixed = equiv.position - fixedSupport.position;
        momentAboutFixed += equiv.force * distFromFixed;
        if (equiv.moment) momentAboutFixed += equiv.moment;
      }

      const R_roller = -momentAboutFixed / L;
      const R_fixed = -(totalFy + R_roller);

      reactions.get(rollerOriginalIdx)!.vertical = R_roller;
      reactions.get(fixedOriginalIdx)!.vertical = R_fixed;
      reactions.get(fixedOriginalIdx)!.moment = 0; // Simplified

      return {
        reactions,
        isValid: this.verifyEquilibrium(reactions),
      };
    }

    return {
      reactions,
      isValid: false,
      errorMessage: 'Desteklenmeyen mesnet konfigürasyonu.',
    };
  }

  private verifyEquilibrium(reactions: Map<number, ReactionForce>): boolean {
    let sumFx = 0;
    let sumFy = 0;
    let sumM = 0;

    // Sum reactions
    for (const [idx, r] of reactions) {
      const supportPos = this.config.supports[idx].position;
      sumFx += r.horizontal;
      sumFy += r.vertical;
      sumM += r.moment + r.vertical * supportPos; // Moment about x=0
    }

    // Sum loads
    for (const load of this.config.loads) {
      const equiv = this.getEquivalentLoad(load);
      sumFy += equiv.force;
      sumM += equiv.force * equiv.position;
      if (equiv.moment) sumM += equiv.moment;
    }

    const tolerance = 1e-6;
    return (
      Math.abs(sumFx) < tolerance &&
      Math.abs(sumFy) < tolerance &&
      Math.abs(sumM) < tolerance
    );
  }

  // Calculate internal forces (Shear & Moment) along the beam
  calculateInternalForces(results: ReactionResults): AnalysisResults {
    const points: InternalForcesPoint[] = [];
    const numPoints = 200; // More points for accuracy
    const dx = this.config.length / (numPoints - 1);

    // Create critical points list (supports, load positions, load starts/ends)
    const criticalPoints = new Set<number>([0, this.config.length]);

    for (const s of this.config.supports) {
      criticalPoints.add(s.position);
    }
    for (const load of this.config.loads) {
      if (load.type === LoadType.POINT || load.type === LoadType.MOMENT) {
        criticalPoints.add(load.position);
      } else {
        criticalPoints.add(load.startPosition);
        criticalPoints.add(load.endPosition);
      }
    }

    // Generate points including critical points
    const xValues: number[] = [];
    for (let i = 0; i < numPoints; i++) {
      xValues.push(i * dx);
    }
    // Add critical points
    for (const cp of criticalPoints) {
      if (!xValues.some(x => Math.abs(x - cp) < 1e-6)) {
        xValues.push(cp);
      }
    }
    xValues.sort((a, b) => a - b);

    for (const x of xValues) {
      let shear = 0;
      let moment = 0;

      // Add reaction contributions (reactions oppose loads)
      for (const [idx, r] of results.reactions) {
        const supportPos = this.config.supports[idx].position;
        if (x >= supportPos - this.EPSILON) {
          shear += r.vertical;
          moment += r.vertical * (x - supportPos) + r.moment;
        }
      }

      // Subtract load contributions
      for (const load of this.config.loads) {
        if (load.type === LoadType.POINT) {
          if (x >= load.position - this.EPSILON) {
            shear += load.magnitude; // magnitude is negative (downward)
            moment += load.magnitude * (x - load.position);
          }
        } else if (load.type === LoadType.UDL) {
          if (x > load.startPosition + this.EPSILON) {
            const loadEnd = Math.min(x, load.endPosition);
            const loadedLength = loadEnd - load.startPosition;
            const loadForce = load.magnitude * loadedLength;
            const loadCentroid = load.startPosition + loadedLength / 2;
            shear += loadForce;
            moment += loadForce * (x - loadCentroid);
          }
        } else if (load.type === LoadType.TRIANGULAR) {
          if (x > load.startPosition + this.EPSILON) {
            const loadEnd = Math.min(x, load.endPosition);
            const loadedLength = loadEnd - load.startPosition;
            const totalLength = load.endPosition - load.startPosition;
            const ratio = loadedLength / totalLength;
            const loadForce = (load.maxMagnitude * loadedLength * ratio) / 2;
            // Centroid of partial triangle
            const loadCentroid =
              load.startPosition + (loadedLength * (2 + ratio)) / (3 * (1 + ratio));
            shear += loadForce;
            moment += loadForce * (x - loadCentroid);
          }
        } else if (load.type === LoadType.MOMENT) {
          if (x >= load.position - this.EPSILON) {
            moment += load.magnitude;
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
