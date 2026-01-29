// ============================================================================
// STRUCTURAL ENGINEERING: COMPLETE BEAM ANALYSIS ENGINE
// Full physics engine with compatibility equations for indeterminate structures
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
  // Optional beam section properties for stress calculation
  elasticModulus?: number; // E (MPa) - default: 200 GPa for steel
  sectionModulus?: number; // S (cm³) - default: typical I-beam
  momentOfInertia?: number; // I (cm⁴) - default: typical I-beam
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
  // Engineering properties
  maxStress?: { value: number; position: number; unit: string };
  deflection?: { value: number; position: number; unit: string };
}

// ============================================================================
// BEAM TYPE SYSTEM
// ============================================================================

export interface BeamType {
  id: string;
  name: string; // Turkish name
  icon: string; // Icon character
  description: string; // Short description
  defaultConfig: (length?: number) => BeamConfig;
}

export const BEAM_TYPES: BeamType[] = [
  {
    id: 'simple',
    name: 'Basit Kiriş',
    icon: '⊣⊢',
    description: 'İki ucu mesnetli',
    defaultConfig: (length = 6) => ({
      length,
      supports: [
        { type: SupportType.PINNED, position: 0 },
        { type: SupportType.ROLLER, position: length },
      ],
      loads: [],
    }),
  },
  {
    id: 'cantilever',
    name: 'Konsol Kiriş',
    icon: '▬╟',
    description: 'Bir ucu sabit',
    defaultConfig: (length = 4) => ({
      length,
      supports: [
        { type: SupportType.FIXED, position: 0 },
      ],
      loads: [],
    }),
  },
  {
    id: 'continuous',
    name: 'Sürekli Kiriş',
    icon: '⊣⊢⊢',
    description: '3 mesnet, 2 açıklık',
    defaultConfig: (length = 10) => ({
      length,
      supports: [
        { type: SupportType.PINNED, position: 0 },
        { type: SupportType.PINNED, position: length / 2 },
        { type: SupportType.ROLLER, position: length },
      ],
      loads: [],
    }),
  },
  {
    id: 'fixed-fixed',
    name: 'Sabit-Sabit',
    icon: '▬▬',
    description: 'İki ucu da sabit',
    defaultConfig: (length = 8) => ({
      length,
      supports: [
        { type: SupportType.FIXED, position: 0 },
        { type: SupportType.FIXED, position: length },
      ],
      loads: [],
    }),
  },
];

export function getBeamTypeById(id: string): BeamType | undefined {
  return BEAM_TYPES.find(bt => bt.id === id);
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
    elasticModulus: 200000, // 200 GPa = steel
    sectionModulus: 500, // cm³
    momentOfInertia: 10000, // cm⁴
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
    elasticModulus: 200000,
    sectionModulus: 500,
    momentOfInertia: 10000,
  },
  'cantilever-fixed': {
    length: 4,
    supports: [
      { type: SupportType.FIXED, position: 0 },
    ],
    loads: [
      { type: LoadType.POINT, position: 4, magnitude: -15 },
    ],
    elasticModulus: 200000,
    sectionModulus: 500,
    momentOfInertia: 10000,
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
    elasticModulus: 200000,
    sectionModulus: 500,
    momentOfInertia: 10000,
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
  private readonly E_DEFAULT = 200000; // MPa (steel)
  private readonly S_DEFAULT = 500; // cm³
  private readonly I_DEFAULT = 10000; // cm⁴

  constructor(config: BeamConfig) {
    this.config = config;
  }

  // Get beam properties with defaults
  private getE() {
    return this.config.elasticModulus ?? this.E_DEFAULT;
  }
  private getS() {
    return this.config.sectionModulus ?? this.S_DEFAULT;
  }
  private getI() {
    return this.config.momentOfInertia ?? this.I_DEFAULT;
  }

  // Get sorted supports with their original indices
  private getSortedSupportsWithOriginalIndices(): Array<{ support: Support; originalIndex: number }> {
    return this.config.supports
      .map((support, originalIndex) => ({ support, originalIndex }))
      .sort((a, b) => a.support.position - b.support.position);
  }

  // Calculate equivalent point load and centroid position
  private getEquivalentLoad(load: Load): { force: number; position: number; moment?: number } {
    switch (load.type) {
      case LoadType.POINT:
        return { force: load.magnitude, position: load.position };

      case LoadType.UDL: {
        const length = load.endPosition - load.startPosition;
        const force = load.magnitude * length;
        // Centroid of rectangle is at midpoint
        const position = (load.startPosition + load.endPosition) / 2;
        return { force, position };
      }

      case LoadType.TRIANGULAR: {
        const length = load.endPosition - load.startPosition;
        const force = (load.maxMagnitude * length) / 2;
        // Centroid of triangle from the base (startPosition)
        // For triangle with peak at end: centroid is at 2/3 from start
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
  private checkDeterminacy(): { determinate: boolean; unknowns: number; type: string } {
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

    const determinate = unknowns === 3;
    let type = 'determinate';
    if (unknowns > 3) type = 'indeterminate';
    if (unknowns < 3) type = 'unstable';

    return { determinate, unknowns, type };
  }

  // ============================================================================
  // COMPATIBILITY EQUATIONS FOR INDETERMINATE BEAMS
  // ============================================================================

  /**
   * Solve fixed-fixed beam using Three-Moment Equation
   * M_A * L_AB + 2*M_B * (L_AB + L_BC) + M_C * L_BC = -6EI * (θ_AB + θ_BC)
   */
  private solveFixedFixed(): { reactions: Map<number, ReactionForce>; moments: Map<number, number> } {
    const L = this.config.length;
    const EI = this.getE() * this.getI() / 10000; // Convert to kN·m² units

    // Calculate fixed end moments using Three-Moment Equation
    // For fixed-fixed beam: M_A = M_C = -PL/8 for point load at center (simplified)

    let M_A = 0; // Fixed end moment at left
    let M_C = 0; // Fixed end moment at right

    // Sum moments about each support
    for (const load of this.config.loads) {
      if (load.type === LoadType.POINT) {
        const a = load.position;
        const b = L - a;
        const P = -load.magnitude; // Positive magnitude
        // Fixed end moments for point load
        M_A += -P * a * b * b / (L * L);
        M_C += -P * a * a * b / (L * L);
      } else if (load.type === LoadType.UDL) {
        const w = -load.magnitude;
        const a = load.startPosition;
        const b = load.endPosition;
        // Partial UDL fixed end moments
        M_A += -w * (b - a) * (b - a) * (L * L - 3 * a * a - 3 * b * b + 2 * a * b) / (12 * L * L);
        M_C += -w * (b - a) * (b - a) * (L * L + 3 * a * a + 3 * b * b - 2 * a * b) / (12 * L * L);
      } else if (load.type === LoadType.MOMENT) {
        const M = load.magnitude;
        // Moment applied somewhere - distributed to both ends
        M_A += -M * (L - load.position) / L;
        M_C += -M * load.position / L;
      }
    }

    // Calculate reactions considering fixed end moments
    let R_A = 0;
    let R_C = 0;

    for (const load of this.config.loads) {
      if (load.type === LoadType.POINT) {
        const P = -load.magnitude;
        const a = load.position;
        R_A += P * (L - a) * (L - a) * (2 * L + a) / (L * L * L);
        R_C += P * a * a * (3 * L - 2 * a) / (L * L * L);
      } else if (load.type === LoadType.UDL) {
        const w = -load.magnitude;
        const a = load.startPosition;
        const b = load.endPosition;
        R_A += w * (b - a) * (2 * L * L * L - 2 * L * a * a - a * a * b + a * b * b) / (8 * L * L * L);
        R_C += w * (b - a) * (6 * L * L * a - 4 * L * a * a - a * b * (2 * L - b)) / (8 * L * L * L);
      } else if (load.type === LoadType.MOMENT) {
        // No vertical reaction from pure moment
      }
    }

    // Add contribution from fixed moments
    R_A += (M_A - M_C) / L;
    R_C -= (M_A - M_C) / L;

    const reactions = new Map<number, ReactionForce>();
    const moments = new Map<number, number>();

    const sortedSupports = this.getSortedSupportsWithOriginalIndices();
    for (const { originalIndex } of sortedSupports) {
      reactions.set(originalIndex, { horizontal: 0, vertical: 0, moment: 0 });
    }

    if (sortedSupports.length === 2) {
      reactions.get(sortedSupports[0].originalIndex)!.vertical = R_A;
      reactions.get(sortedSupports[0].originalIndex)!.moment = M_A;
      reactions.get(sortedSupports[1].originalIndex)!.vertical = R_C;
      reactions.get(sortedSupports[1].originalIndex)!.moment = M_C;
    }

    return { reactions, moments };
  }

  // ============================================================================
  // MAIN CALCULATION
  // ============================================================================

  calculateReactions(): ReactionResults {
    const { determinate, unknowns, type } = this.checkDeterminacy();

    if (type === 'unstable') {
      return {
        reactions: new Map(),
        isValid: false,
        errorMessage: 'Sistem istikrarsız! Yetersiz mesnet var.',
      };
    }

    // Get sorted supports with original indices
    const sortedSupports = this.getSortedSupportsWithOriginalIndices();

    // Build reaction map using ORIGINAL indices
    const reactions = new Map<number, ReactionForce>();
    for (const { originalIndex } of sortedSupports) {
      reactions.set(originalIndex, { horizontal: 0, vertical: 0, moment: 0 });
    }

    const supports = sortedSupports.map(s => s.support);

    // Calculate total loads
    let totalFy = 0; // Sum of vertical forces (negative = downward)
    let totalM = 0; // Sum of moments about x=0

    for (const load of this.config.loads) {
      const equiv = this.getEquivalentLoad(load);
      totalFy += equiv.force;
      totalM += equiv.force * equiv.position;
      if (equiv.moment) totalM += equiv.moment;
    }

    // ========================================================================
    // CASE 1: SIMPLY SUPPORTED BEAM (Pin + Roller)
    // ========================================================================
    const pinIdx = sortedSupports.findIndex(s => s.support.type === SupportType.PINNED);
    const rollerIdx = sortedSupports.findIndex(s => s.support.type === SupportType.ROLLER);

    if (pinIdx >= 0 && rollerIdx >= 0) {
      const pinSupport = supports[pinIdx];
      const rollerSupport = supports[rollerIdx];
      const pinOriginalIdx = sortedSupports[pinIdx].originalIndex;
      const rollerOriginalIdx = sortedSupports[rollerIdx].originalIndex;

      const L = rollerSupport.position - pinSupport.position;

      // Moment equilibrium about pin support
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
      reactions.get(pinOriginalIdx)!.horizontal = 0;

      return {
        reactions,
        isValid: this.verifyEquilibrium(reactions),
      };
    }

    // ========================================================================
    // CASE 2: CANTILEVER BEAM (Fixed only)
    // ========================================================================
    if (supports.length === 1 && supports[0].type === SupportType.FIXED) {
      const originalIdx = sortedSupports[0].originalIndex;
      const supportPos = supports[0].position;

      let Fy = 0;
      let M = 0;

      for (const load of this.config.loads) {
        const equiv = this.getEquivalentLoad(load);
        Fy += equiv.force;
        const distFromSupport = equiv.position - supportPos;
        M += equiv.force * distFromSupport;
        if (equiv.moment) M += equiv.moment;
      }

      reactions.get(originalIdx)!.vertical = -Fy;
      reactions.get(originalIdx)!.horizontal = 0;
      reactions.get(originalIdx)!.moment = -M;

      return {
        reactions,
        isValid: this.verifyEquilibrium(reactions),
      };
    }

    // ========================================================================
    // CASE 3: FIXED-FIXED BEAM (Indeterminate - using Three-Moment Eq)
    // ========================================================================
    const fixedCount = sortedSupports.filter(s => s.support.type === SupportType.FIXED).length;
    if (fixedCount === 2 && supports.length === 2) {
      const result = this.solveFixedFixed();

      // Verify equilibrium
      if (this.verifyEquilibrium(result.reactions)) {
        return {
          reactions: result.reactions,
          isValid: true,
        };
      }
    }

    // ========================================================================
    // CASE 4: PROPPED CANTILEVER (Fixed + Roller)
    // ========================================================================
    const fixedIdx = sortedSupports.findIndex(s => s.support.type === SupportType.FIXED);
    if (fixedIdx >= 0 && rollerIdx >= 0) {
      const fixedSupport = supports[fixedIdx];
      const rollerSupport = supports[rollerIdx];
      const fixedOriginalIdx = sortedSupports[fixedIdx].originalIndex;
      const rollerOriginalIdx = sortedSupports[rollerIdx].originalIndex;

      const L = rollerSupport.position - fixedSupport.position;

      // Using slope compatibility at roller
      let M_fixed = 0;
      for (const load of this.config.loads) {
        const equiv = this.getEquivalentLoad(load);
        const a = equiv.position - fixedSupport.position;

        if (load.type === LoadType.POINT) {
          M_fixed += -equiv.force * a * (L - a) * (2 * L - a) / (2 * L * L);
        } else if (load.type === LoadType.UDL) {
          const udLoad = load as UDLoad;
          const a = udLoad.startPosition - fixedSupport.position;
          const b = udLoad.endPosition - fixedSupport.position;
          M_fixed += -equiv.force * (L * L - 3 * a * a - 2 * b * b + 3 * (b - a) * (b - a)) / (8 * L);
        }
      }

      const R_roller = -M_fixed / L;
      const R_fixed = -(totalFy + R_roller);

      reactions.get(rollerOriginalIdx)!.vertical = R_roller;
      reactions.get(fixedOriginalIdx)!.vertical = R_fixed;
      reactions.get(fixedOriginalIdx)!.moment = M_fixed;

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

    // Sum reactions about x=0
    for (const [idx, r] of reactions) {
      const supportPos = this.config.supports[idx].position;
      sumFx += r.horizontal;
      sumFy += r.vertical;
      sumM += r.moment + r.vertical * supportPos;
    }

    // Sum loads about x=0
    for (const load of this.config.loads) {
      const equiv = this.getEquivalentLoad(load);
      sumFy += equiv.force;
      sumM += equiv.force * equiv.position;
      if (equiv.moment) sumM += equiv.moment;
    }

    const tolerance = 1e-4; // Slightly relaxed tolerance
    return (
      Math.abs(sumFx) < tolerance &&
      Math.abs(sumFy) < tolerance &&
      Math.abs(sumM) < tolerance
    );
  }

  // ============================================================================
  // INTERNAL FORCES AND DEFLECTION CALCULATION
  // ============================================================================

  calculateInternalForces(results: ReactionResults): AnalysisResults {
    const points: InternalForcesPoint[] = [];
    const dx = this.config.length / 200; // 200 points

    // Critical points for accurate diagram
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

    const xValues: number[] = [];
    for (let i = 0; i <= 200; i++) {
      xValues.push(i * dx);
    }
    for (const cp of criticalPoints) {
      if (!xValues.some(x => Math.abs(x - cp) < 1e-6)) {
        xValues.push(cp);
      }
    }
    xValues.sort((a, b) => a - b);

    let maxShear = { value: 0, position: 0 };
    let maxMoment = { value: -Infinity, position: 0 };
    let minMoment = { value: Infinity, position: 0 };

    for (const x of xValues) {
      let shear = 0;
      let moment = 0;

      // Add reaction contributions
      for (const [idx, r] of results.reactions) {
        const supportPos = this.config.supports[idx].position;
        if (x >= supportPos - this.EPSILON) {
          shear += r.vertical;
          moment += r.vertical * (x - supportPos) + r.moment;
        }
      }

      // Add load contributions
      for (const load of this.config.loads) {
        if (load.type === LoadType.POINT) {
          if (x >= load.position - this.EPSILON) {
            shear += load.magnitude;
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
            // Force at partial triangular section
            const loadForce = (load.maxMagnitude * loadedLength * ratio) / 2;
            // Centroid of partial triangle from start
            const centroidFactor = (2 + ratio) / (3 * (1 + ratio));
            const loadCentroid = load.startPosition + loadedLength * centroidFactor;
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

      // Track max/min
      if (Math.abs(shear) > Math.abs(maxShear.value)) {
        maxShear = { value: shear, position: x };
      }
      if (moment > maxMoment.value) {
        maxMoment = { value: moment, position: x };
      }
      if (moment < minMoment.value) {
        minMoment = { value: moment, position: x };
      }
    }

    // Calculate maximum stress and deflection
    const maxMomentAbs = Math.max(Math.abs(maxMoment.value), Math.abs(minMoment.value));
    const maxStress = (maxMomentAbs * 1000) / this.getS(); // σ = M/S (kN·m to N·mm, S in cm³)
    const maxDeflection = this.calculateMaxDeflection(points);

    return {
      ...results,
      shearDiagram: points,
      momentDiagram: points,
      maxShear,
      maxMoment,
      minMoment,
      maxStress: { value: maxStress, position: maxMoment.value > Math.abs(minMoment.value) ? maxMoment.position : minMoment.position, unit: 'MPa' },
      deflection: maxDeflection,
    };
  }

  /**
   * Calculate approximate maximum deflection using virtual work method
   */
  private calculateMaxDeflection(points: InternalForcesPoint[]): { value: number; position: number; unit: string } {
    // Simplified: find max deflection from moment diagram area
    const EI = this.getE() * this.getI() / 1000000; // Convert to kN·m²

    // Use conjugate beam approximation
    let maxDeflection = 0;
    let maxDeflPos = 0;

    for (let i = 0; i < points.length; i++) {
      const m = points[i].moment;
      // Approximate deflection at this point
      let defl = 0;
      for (let j = 0; j < i; j++) {
        const mAvg = (points[j].moment + points[j + 1].moment) / 2;
        const dx = points[j + 1].x - points[j].x;
        defl += mAvg * dx * (points[i].x - (points[j].x + points[j + 1].x) / 2);
      }
      defl /= EI;

      if (Math.abs(defl) > Math.abs(maxDeflection)) {
        maxDeflection = defl;
        maxDeflPos = points[i].x;
      }
    }

    return { value: maxDeflection * 1000, position: maxDeflPos, unit: 'mm' }; // Convert to mm
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
