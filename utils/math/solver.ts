import { create, all } from 'mathjs';

const math = create(all);

// Beam Solver - Support Reaction Calculator
export function calculateBeamReactions(
  length: number,
  loads: Array<{ type: 'point' | 'udl'; position: number; magnitude: number }>,
  supports: Array<{ type: 'pin' | 'roller'; position: number }>
) {
  // Simple 2D beam equilibrium: ΣFx = 0, ΣFy = 0, ΣM = 0
  let totalLoad = 0;
  let momentAboutA = 0;

  for (const load of loads) {
    if (load.type === 'point') {
      totalLoad += load.magnitude;
      momentAboutA += load.magnitude * load.position;
    } else if (load.type === 'udl') {
      // UDL treated as point load at center of distributed length
      totalLoad += load.magnitude;
      momentAboutA += load.magnitude * load.position;
    }
  }

  // Two reactions: R1 and R2
  // ΣFy = R1 + R2 - totalLoad = 0
  // ΣM about R1 = R2 * span - momentAboutA = 0

  if (supports.length < 2) {
    return { error: 'Insufficient supports for stable beam' };
  }

  const span = supports[1].position - supports[0].position;
  const R2 = momentAboutA / span;
  const R1 = totalLoad - R2;

  return {
    R1: math.round(R1, 3),
    R2: math.round(R2, 3),
    totalLoad: math.round(totalLoad, 3),
  };
}

// Truss Solver - Method of Joints using Matrix Method
export function solveTruss(
  nodes: Array<{ id: string; x: number; y: number; fixed: boolean }>,
  members: Array<{ id: string; nodeA: string; nodeB: string }>
) {
  const nodeCount = nodes.length;
  const memberCount = members.length;

  // Degree of indeterminacy check
  const reactions = nodes.filter((n) => n.fixed).length * 2;
  const unknowns = memberCount + reactions;
  const equations = nodeCount * 2;

  if (unknowns !== equations) {
    return {
      error: `Statically ${unknowns > equations ? 'indeterminate' : 'unstable'} structure. Unknowns: ${unknowns}, Equations: ${equations}`,
    };
  }

  // Build stiffness matrix [K]{u} = {F}
  const K: number[][] = Array(equations).fill(0).map(() => Array(equations).fill(0));
  const F: number[] = Array(equations).fill(0);

  // Map node IDs to DOF indices
  const nodeMap = new Map<string, number>();
  let dofIndex = 0;
  for (const node of nodes) {
    nodeMap.set(node.id, dofIndex);
    dofIndex += 2;
  }

  // Assemble stiffness matrix
  for (const member of members) {
    const nodeA = nodes.find((n) => n.id === member.nodeA);
    const nodeB = nodes.find((n) => n.id === member.nodeB);

    if (!nodeA || !nodeB) continue;

    const dx = nodeB.x - nodeA.x;
    const dy = nodeB.y - nodeA.y;
    const L = Math.sqrt(dx * dx + dy * dy);

    const c = dx / L; // cos
    const s = dy / L; // sin

    const k = 1000; // EA/L assumed constant for demo

    const iA = nodeMap.get(nodeA.id)!;
    const iB = nodeMap.get(nodeB.id)!;

    // Member stiffness contributions
    const coeffs = [
      [k * c * c, k * c * s],
      [k * c * s, k * s * s],
    ];

    // Add to global matrix (simplified)
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        K[iA + i][iA + j] += coeffs[i][j];
        K[iB + i][iB + j] += coeffs[i][j];
        K[iA + i][iB + j] -= coeffs[i][j];
        K[iB + i][iA + j] -= coeffs[i][j];
      }
    }
  }

  try {
    // Solve using mathjs LU decomposition
    const K_inv = math.inv(K);
    const u = math.multiply(K_inv, F) as number[];

    // Calculate member forces from displacements
    const memberForces: Array<{ id: string; force: number; type: 'tension' | 'compression' }> = [];

    for (const member of members) {
      const nodeA = nodes.find((n) => n.id === member.nodeA);
      const nodeB = nodes.find((n) => n.id === member.nodeB);

      if (!nodeA || !nodeB) continue;

      const dx = nodeB.x - nodeA.x;
      const dy = nodeB.y - nodeA.y;
      const L = Math.sqrt(dx * dx + dy * dy);

      const iA = nodeMap.get(nodeA.id)!;
      const iB = nodeMap.get(nodeB.id)!;

      const uAx = u[iA];
      const uAy = u[iA + 1];
      const uBx = u[iB];
      const uBy = u[iB + 1];

      const c = dx / L;
      const s = dy / L;

      const force = 1000 * ((uBx - uAx) * c + (uBy - uAy) * s);
      memberForces.push({
        id: member.id,
        force: math.round(force, 2),
        type: force > 0 ? 'tension' : 'compression',
      });
    }

    return { memberForces, displacements: u };
  } catch (error) {
    return { error: 'Matrix solution failed: structure may be unstable' };
  }
}

// Unit Converter
export function convertUnits(
  value: number,
  from: string,
  to: string
): number {
  const conversions: Record<string, number> = {
    // Force: kN to kgf
    'kN_to_kgf': 101.97,
    'kgf_to_kN': 1 / 101.97,
    // Pressure: MPa to psi
    'MPa_to_psi': 145.038,
    'psi_to_MPa': 1 / 145.038,
    // Length: m to ft
    'm_to_ft': 3.28084,
    'ft_to_m': 1 / 3.28084,
  };

  const key = `${from}_to_${to}`;
  const factor = conversions[key];

  if (factor === undefined) {
    throw new Error(`Unsupported conversion: ${from} to ${to}`);
  }

  return math.round(value * factor, 4);
}
