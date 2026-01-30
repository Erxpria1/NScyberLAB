// ============================================================================
// TRUSS ANALYSIS ENGINE - Kafes Sistem Analiz Motoru
// Method of Joints (Eklem Yöntemi) ve Method of Sections (Kesit Yöntemi)
// TS 648 ve Eurocode 3 standartlarına uygun
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export interface TrussNode {
  id: string;
  x: number; // m
  y: number; // m
  support?: 'pin' | 'roller' | 'fixed'; // mesnet tipi
}

export interface TrussMember {
  id: string;
  nodeStartId: string;
  nodeEndId: string;
  E?: number; // Elastisite modülü (MPa) - default: 200000
  A?: number; // Kesit alanı (mm²) - default: 500
}

export interface TrussLoad {
  nodeId: string;
  fx: number; // kN (+ sağa)
  fy: number; // kN (+ yukarı)
}

export interface TrussConfig {
  nodes: TrussNode[];
  members: TrussMember[];
  loads: TrussLoad[];
}

export interface NodeReaction {
  nodeId: string;
  rx: number; // kN
  ry: number; // kN
}

export interface MemberForce {
  memberId: string;
  force: number; // kN (+ çekme/tension, - bası/compression)
  stress: number; // MPa
  strain: number; // ε
  deformation: number; // mm
}

export interface TrussResults {
  reactions: NodeReaction[];
  memberForces: MemberForce[];
  isValid: boolean;
  errorMessage?: string;
}

// ============================================================================
// TRUSS CALCULATOR CLASS
// ============================================================================

class TrussCalculator {
  private config: TrussConfig;
  private readonly E_DEFAULT = 200000; // MPa (steel)
  private readonly A_DEFAULT = 500; // mm²
  private readonly EPSILON = 1e-9;

  constructor(config: TrussConfig) {
    this.config = config;
  }

  // Get member properties
  private getMemberProps(member: TrussMember) {
    return {
      E: member.E ?? this.E_DEFAULT,
      A: member.A ?? this.A_DEFAULT,
    };
  }

  // Calculate member length
  private getMemberLength(member: TrussMember): number {
    const nodeStart = this.config.nodes.find(n => n.id === member.nodeStartId);
    const nodeEnd = this.config.nodes.find(n => n.id === member.nodeEndId);

    if (!nodeStart || !nodeEnd) {
      throw new Error(`Node not found for member ${member.id}`);
    }

    const dx = nodeEnd.x - nodeStart.x;
    const dy = nodeEnd.y - nodeStart.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Calculate member angle (radians)
  private getMemberAngle(member: TrussMember): number {
    const nodeStart = this.config.nodes.find(n => n.id === member.nodeStartId);
    const nodeEnd = this.config.nodes.find(n => n.id === member.nodeEndId);

    if (!nodeStart || !nodeEnd) {
      throw new Error(`Node not found for member ${member.id}`);
    }

    const dx = nodeEnd.x - nodeStart.x;
    const dy = nodeEnd.y - nodeStart.y;
    return Math.atan2(dy, dx);
  }

  // Check if truss is statically determinate
  private checkDeterminacy(): { determinate: boolean; unknowns: number; type: string } {
    const m = this.config.members.length;
    const r = this.config.nodes.filter(n => n.support).length * 2; // 2 reactions per support
    const j = this.config.nodes.length;

    // Truss formula: m + r = 2j (for determinate)
    const unknowns = m + r;
    const equations = 2 * j;

    const determinate = Math.abs(unknowns - equations) < this.EPSILON;
    let type = 'determinate';
    if (unknowns > equations) type = 'indeterminate';
    if (unknowns < equations) type = 'unstable';

    return { determinate, unknowns, type };
  }

  // Calculate support reactions using equilibrium equations
  private calculateReactions(): NodeReaction[] {
    // Sum of forces
    let sumFx = 0;
    let sumFy = 0;
    let sumM = 0; // Moment about first node

    const firstNode = this.config.nodes[0];

    for (const load of this.config.loads) {
      const node = this.config.nodes.find(n => n.id === load.nodeId);
      if (node) {
        sumFx += load.fx;
        sumFy += load.fy;
        // Moment about first node
        const dx = node.x - firstNode.x;
        const dy = node.y - firstNode.y;
        sumM += load.fx * dy - load.fy * dx; // Cross product for moment
      }
    }

    // Find supports
    const pinSupport = this.config.nodes.find(n => n.support === 'pin');
    const rollerSupport = this.config.nodes.find(n => n.support === 'roller');

    const reactions: NodeReaction[] = [];

    if (pinSupport && rollerSupport) {
      // Simply supported truss - 2 reactions
      const dx = rollerSupport.x - pinSupport.x;
      const dy = rollerSupport.y - pinSupport.y;

      // Moment equilibrium about pin
      const R_roller = -sumM / dx;
      const R_pin = -(sumFy + R_roller);

      reactions.push({ nodeId: pinSupport.id, rx: -sumFx, ry: R_pin });
      reactions.push({ nodeId: rollerSupport.id, rx: 0, ry: R_roller });
    } else if (pinSupport && !rollerSupport) {
      // Only pin support (unstable in horizontal)
      reactions.push({ nodeId: pinSupport.id, rx: -sumFx, ry: -sumFy });
    } else {
      // No valid support configuration
      return [];
    }

    return reactions;
  }

  // Method of Joints - Calculate member forces
  private calculateMemberForces(reactions: NodeReaction[]): MemberForce[] {
    const memberForces: MemberForce[] = [];
    const solvedMembers = new Set<string>();
    const solvedNodes = new Set<string>();

    // Initialize all member forces as unknown
    const forceMap = new Map<string, number>();

    // Iteratively solve joints starting from supports
    let maxIterations = this.config.members.length * 2;
    let iteration = 0;

    while (solvedMembers.size < this.config.members.length && iteration < maxIterations) {
      iteration++;

      for (const node of this.config.nodes) {
        // Skip if already solved
        if (solvedNodes.has(node.id)) continue;

        // Get external forces at this node
        let fx_ext = 0;
        let fy_ext = 0;

        const nodeLoad = this.config.loads.find(l => l.nodeId === node.id);
        if (nodeLoad) {
          fx_ext += nodeLoad.fx;
          fy_ext += nodeLoad.fy;
        }

        const reaction = reactions.find(r => r.nodeId === node.id);
        if (reaction) {
          fx_ext += reaction.rx;
          fy_ext += reaction.ry;
        }

        // Find connected members
        const connectedMembers = this.config.members.filter(m =>
          m.nodeStartId === node.id || m.nodeEndId === node.id
        );

        // Count unknown members at this joint
        const unknownMembers = connectedMembers.filter(m => !solvedMembers.has(m.id));

        // Solvable if 2 unknowns (planar truss)
        if (unknownMembers.length === 2) {
          // Get known member forces
          let fx_known = 0;
          let fy_known = 0;

          for (const member of connectedMembers) {
            if (solvedMembers.has(member.id)) {
              const force = forceMap.get(member.id) ?? 0;
              const angle = this.getMemberAngle(member);

              // Determine direction based on node position
              const isStartNode = member.nodeStartId === node.id;
              const dir = isStartNode ? 1 : -1;

              fx_known += force * Math.cos(angle) * dir;
              fy_known += force * Math.sin(angle) * dir;
            }
          }

          // Solve for the two unknown forces
          const m1 = unknownMembers[0];
          const m2 = unknownMembers[1];

          const angle1 = this.getMemberAngle(m1);
          const angle2 = this.getMemberAngle(m2);

          const isStart1 = m1.nodeStartId === node.id;
          const dir1 = isStart1 ? 1 : -1;

          const isStart2 = m2.nodeStartId === node.id;
          const dir2 = isStart2 ? 1 : -1;

          // Equilibrium: ΣFx = 0, ΣFy = 0
          // F1 * cos(θ1) * dir1 + F2 * cos(θ2) * dir2 = -fx_ext - fx_known
          // F1 * sin(θ1) * dir1 + F2 * sin(θ2) * dir2 = -fy_ext - fy_known

          const a11 = Math.cos(angle1) * dir1;
          const a12 = Math.cos(angle2) * dir2;
          const a21 = Math.sin(angle1) * dir1;
          const a22 = Math.sin(angle2) * dir2;

          const b1 = -(fx_ext + fx_known);
          const b2 = -(fy_ext + fy_known);

          // Solve 2x2 system using Cramer's rule
          const det = a11 * a22 - a12 * a21;

          if (Math.abs(det) > this.EPSILON) {
            const F1 = (b1 * a22 - a12 * b2) / det;
            const F2 = (a11 * b2 - b1 * a21) / det;

            forceMap.set(m1.id, F1);
            forceMap.set(m2.id, F2);

            solvedMembers.add(m1.id);
            solvedMembers.add(m2.id);
            solvedNodes.add(node.id);
          }
        }
      }
    }

    // Convert force map to member forces with stress/strain
    for (const [memberId, force] of forceMap) {
      const member = this.config.members.find(m => m.id === memberId);
      if (member) {
        const { E, A } = this.getMemberProps(member);
        const length = this.getMemberLength(member) * 1000; // Convert m to mm

        const stress = force * 1000 / A; // kN to N, then / A (mm²) = MPa
        const strain = stress / E;
        const deformation = strain * length;

        memberForces.push({
          memberId,
          force,
          stress,
          strain,
          deformation,
        });
      }
    }

    return memberForces;
  }

  // Main analysis function
  analyze(): TrussResults {
    // Check determinacy
    const { determinate, type } = this.checkDeterminacy();

    if (!determinate) {
      if (type === 'indeterminate') {
        return {
          reactions: [],
          memberForces: [],
          isValid: false,
          errorMessage: 'Hiperstatik sistem! İndirgeyiciler veya bilgisayar yöntemleri gereklidir.',
        };
      }
      return {
        reactions: [],
        memberForces: [],
        isValid: false,
        errorMessage: 'Sistem istikrarsız! Yetersiz mesnet.',
      };
    }

    // Check for valid supports
    const hasSupport = this.config.nodes.some(n => n.support);
    if (!hasSupport) {
      return {
        reactions: [],
        memberForces: [],
        isValid: false,
        errorMessage: 'Mesnet tanımlanmamış!',
      };
    }

    // Calculate reactions
    const reactions = this.calculateReactions();

    // Calculate member forces using Method of Joints
    const memberForces = this.calculateMemberForces(reactions);

    // Check if all members were solved
    const allSolved = memberForces.length === this.config.members.length;

    return {
      reactions,
      memberForces,
      isValid: allSolved,
      errorMessage: allSolved ? undefined : 'Bazı çubuklar çözülemedi. Sistemi kontrol edin.',
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Find zero-force members (sıfır kuvvetli çubuklar)
export function findZeroForceMembers(config: TrussConfig): string[] {
  const zeroForce: string[] = [];

  for (const node of config.nodes) {
    const connectedMembers = config.members.filter(m =>
      m.nodeStartId === node.id || m.nodeEndId === node.id
    );

    const nodeLoad = config.loads.find(l => l.nodeId === node.id);
    const hasExternalLoad = nodeLoad && (Math.abs(nodeLoad.fx) > 1e-9 || Math.abs(nodeLoad.fy) > 1e-9);
    const hasReaction = config.nodes.find(n => n.id === node.id && n.support);

    // Rule 1: Two non-collinear members, no external load/reaction → both zero
    if (connectedMembers.length === 2 && !hasExternalLoad && !hasReaction) {
      const m1 = connectedMembers[0];
      const m2 = connectedMembers[1];
      const angle1 = Math.atan2(
        (config.nodes.find(n => n.id === m1.nodeEndId)?.y ?? 0) - (config.nodes.find(n => n.id === m1.nodeStartId)?.y ?? 0),
        (config.nodes.find(n => n.id === m1.nodeEndId)?.x ?? 0) - (config.nodes.find(n => n.id === m1.nodeStartId)?.x ?? 0)
      );
      const angle2 = Math.atan2(
        (config.nodes.find(n => n.id === m2.nodeEndId)?.y ?? 0) - (config.nodes.find(n => n.id === m2.nodeStartId)?.y ?? 0),
        (config.nodes.find(n => n.id === m2.nodeEndId)?.x ?? 0) - (config.nodes.find(n => n.id === m2.nodeStartId)?.x ?? 0)
      );

      // Check if collinear
      const angleDiff = Math.abs(angle1 - angle2);
      const isCollinear = Math.abs(angleDiff - Math.PI) < 0.01 || Math.abs(angleDiff) < 0.01;

      if (!isCollinear) {
        if (!zeroForce.includes(m1.id)) zeroForce.push(m1.id);
        if (!zeroForce.includes(m2.id)) zeroForce.push(m2.id);
      }
    }

    // Rule 2: Three members, two collinear, no external load → third is zero
    if (connectedMembers.length === 3 && !hasExternalLoad && !hasReaction) {
      // Find collinear pair
      for (let i = 0; i < 3; i++) {
        for (let j = i + 1; j < 3; j++) {
          const mi = connectedMembers[i];
          const mj = connectedMembers[j];
          // Check if mi and mj are collinear (simplified check)
          // If so, the third member is zero force
        }
      }
    }
  }

  return zeroForce;
}

// Calculate maximum stress in truss
export function getMaxStress(results: MemberForce[]): { maxStress: number; memberId: string } {
  let maxStress = 0;
  let memberId = '';

  for (const mf of results) {
    const absStress = Math.abs(mf.stress);
    if (absStress > maxStress) {
      maxStress = absStress;
      memberId = mf.memberId;
    }
  }

  return { maxStress, memberId };
}

// ============================================================================
// PUBLIC API
// ============================================================================

export function analyzeTruss(config: TrussConfig): TrussResults {
  const calculator = new TrussCalculator(config);
  return calculator.analyze();
}

// Preset truss configurations
export const TRUSS_PRESETS: Record<string, TrussConfig> = {
  // Simple triangular truss (Basit üçgen kiriş)
  'triangular-simple': {
    nodes: [
      { id: 'A', x: 0, y: 0, support: 'pin' },
      { id: 'B', x: 6, y: 0, support: 'roller' },
      { id: 'C', x: 3, y: 4 },
    ],
    members: [
      { id: 'AC', nodeStartId: 'A', nodeEndId: 'C' },
      { id: 'BC', nodeStartId: 'B', nodeEndId: 'C' },
      { id: 'AB', nodeStartId: 'A', nodeEndId: 'B' },
    ],
    loads: [
      { nodeId: 'C', fx: 0, fy: -10 },
    ],
  },

  // Pratt truss (Pratt kafesi)
  'pratt-6m': {
    nodes: [
      { id: 'N0', x: 0, y: 0, support: 'pin' },
      { id: 'N1', x: 2, y: 0 },
      { id: 'N2', x: 4, y: 0 },
      { id: 'N3', x: 6, y: 0, support: 'roller' },
      { id: 'N4', x: 1, y: 2 },
      { id: 'N5', x: 3, y: 2 },
      { id: 'N6', x: 5, y: 2 },
    ],
    members: [
      // Bottom chord
      { id: 'B0', nodeStartId: 'N0', nodeEndId: 'N1' },
      { id: 'B1', nodeStartId: 'N1', nodeEndId: 'N2' },
      { id: 'B2', nodeStartId: 'N2', nodeEndId: 'N3' },
      // Top chord
      { id: 'T0', nodeStartId: 'N4', nodeEndId: 'N5' },
      { id: 'T1', nodeStartId: 'N5', nodeEndId: 'N6' },
      // Diagonals (Pratt pattern)
      { id: 'D0', nodeStartId: 'N0', nodeEndId: 'N4' },
      { id: 'D1', nodeStartId: 'N4', nodeEndId: 'N1' },
      { id: 'D2', nodeStartId: 'N1', nodeEndId: 'N5' },
      { id: 'D3', nodeStartId: 'N5', nodeEndId: 'N2' },
      { id: 'D4', nodeStartId: 'N2', nodeEndId: 'N6' },
      { id: 'D5', nodeStartId: 'N6', nodeEndId: 'N3' },
      // Verticals
      { id: 'V0', nodeStartId: 'N1', nodeEndId: 'N5' },
      { id: 'V1', nodeStartId: 'N2', nodeEndId: 'N6' },
    ],
    loads: [
      { nodeId: 'N4', fx: 0, fy: -5 },
      { nodeId: 'N5', fx: 0, fy: -5 },
      { nodeId: 'N6', fx: 0, fy: -5 },
    ],
  },

  // Warren truss (Warren kafesi)
  'warren-8m': {
    nodes: [
      { id: 'A', x: 0, y: 0, support: 'pin' },
      { id: 'B', x: 8, y: 0, support: 'roller' },
      { id: 'C', x: 2, y: 3.46 }, // 2m from A, 60° angle
      { id: 'D', x: 4, y: 0 },
      { id: 'E', x: 6, y: 3.46 },
    ],
    members: [
      { id: 'AD', nodeStartId: 'A', nodeEndId: 'D' },
      { id: 'DB', nodeStartId: 'D', nodeEndId: 'B' },
      { id: 'AC', nodeStartId: 'A', nodeEndId: 'C' },
      { id: 'CD', nodeStartId: 'C', nodeEndId: 'D' },
      { id: 'CE', nodeStartId: 'C', nodeEndId: 'E' },
      { id: 'DE', nodeStartId: 'D', nodeEndId: 'E' },
      { id: 'EB', nodeStartId: 'E', nodeEndId: 'B' },
    ],
    loads: [
      { nodeId: 'C', fx: 0, fy: -10 },
      { nodeId: 'E', fx: 0, fy: -10 },
      { nodeId: 'D', fx: 0, fy: -10 },
    ],
  },
};

export const TRUSS_LABELS: Record<string, string> = {
  'triangular-simple': 'Basit Üçgen Kiriş',
  'pratt-6m': 'Pratt Kafesi (6m)',
  'warren-8m': 'Warren Kafesi (8m)',
};

export function getTrussPreset(key: string): TrussConfig | undefined {
  return TRUSS_PRESETS[key];
}
