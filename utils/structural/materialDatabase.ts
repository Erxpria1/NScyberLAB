// ============================================================================
// MATERIAL DATABASE - Malzeme Veritabanı
// TS 500, TS 708, TS 648 standartlarına göre beton ve çelik malzemeler
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export type MaterialType = 'concrete' | 'steel' | 'timber' | 'aluminum';

export interface ConcreteMaterial {
  type: 'concrete';
  grade: string;          // C16/20, C20/25, etc.
  fck: number;            // Karakteristik basınç dayanımı (MPa)
  fcd: number;            // Tasarım basınç dayanımı (MPa)
  E: number;              // Elastisite modülü (MPa) - TS 500 formülü
  G: number;              // Kayma modülü (MPa)
  nu: number;             // Poisson oranı
  alpha: number;          // Isıl genleşme katsayısı (1/°C)
  gamma: number;          // Birim hacim ağırlık (kN/m³)
  tensileStrength: number; // Çekme dayanımı (MPa) - yaklaşık
}

export interface SteelMaterial {
  type: 'steel';
  grade: string;          // S220, S420, etc.
  fyk: number;            // Karakteristik akma dayanımı (MPa)
  fyd: number;            // Tasarım akma dayanımı (MPa)
  fuk: number;            // Çekme dayanımı (MPa)
  E: number;              // Elastisite modülü (MPa) - TS 500
  G: number;              // Kayma modülü (MPa)
  nu: number;             // Poisson oranı - TS 648
  alpha: number;          // Isıl genleşme katsayısı (1/°C)
  gamma: number;          // Birim hacim ağırlık (kN/m³)
}

export interface TimberMaterial {
  type: 'timber';
  grade: string;
  fck: number;            // Basınç dayanımı (MPa)
  ft: number;             // Çekme dayanımı paralel lif (MPa)
  E: number;              // Elastisite modülü (MPa)
  G: number;              // Kayma modülü (MPa)
  nu: number;             // Poisson oranı
  alpha: number;          // Isıl genleşme katsayısı (1/°C)
  gamma: number;          // Birim hacim ağırlık (kN/m³)
}

export interface AluminumMaterial {
  type: 'aluminum';
  grade: string;
  fy: number;             // Akma dayanımı (MPa)
  E: number;              // Elastisite modülü (MPa)
  G: number;              // Kayma modülü (MPa)
  nu: number;             // Poisson oranı
  alpha: number;          // Isıl genleşme katsayısı (1/°C)
  gamma: number;          // Birim hacim ağırlık (kN/m³)
}

export type Material = ConcreteMaterial | SteelMaterial | TimberMaterial | AluminumMaterial;

// ============================================================================
// CONCRETE MATERIALS (TS 500)
// ============================================================================

/**
 * Beton elastisite modülü - TS 500 Formülü
 * Ec = 3250 × √(fck) + 14000 (MPa)
 */
export function calculateConcreteModulus(fck: number): number {
  return 3250 * Math.sqrt(fck) + 14000;
}

/**
 * Kayma modülü - G = E / (2 × (1 + ν))
 * Beton için Poisson oranı ν ≈ 0.15-0.20
 */
export function calculateShearModulus(E: number, nu: number): number {
  return E / (2 * (1 + nu));
}

export const CONCRETE_MATERIALS: Record<string, ConcreteMaterial> = {
  C16: {
    type: 'concrete',
    grade: 'C16/20',
    fck: 16,
    fcd: 16 / 1.5, // γc = 1.5 (TS 500)
    E: 3250 * Math.sqrt(16) + 14000, // 27000 MPa
    G: (3250 * Math.sqrt(16) + 14000) / (2 * 1.15),
    nu: 0.15,
    alpha: 1e-5, // 10 × 10⁻⁶ /°C
    gamma: 24, // kN/m³
    tensileStrength: 1.5, // fctm ≈ 0.3 × fck^(2/3)
  },
  C18: {
    type: 'concrete',
    grade: 'C18/22.5',
    fck: 18,
    fcd: 18 / 1.5,
    E: 3250 * Math.sqrt(18) + 14000, // 27782 MPa
    G: (3250 * Math.sqrt(18) + 14000) / (2 * 1.15),
    nu: 0.15,
    alpha: 1e-5,
    gamma: 24,
    tensileStrength: 1.6,
  },
  C20: {
    type: 'concrete',
    grade: 'C20/25',
    fck: 20,
    fcd: 20 / 1.5,
    E: 3250 * Math.sqrt(20) + 14000, // 28536 MPa
    G: (3250 * Math.sqrt(20) + 14000) / (2 * 1.15),
    nu: 0.15,
    alpha: 1e-5,
    gamma: 24,
    tensileStrength: 1.8,
  },
  C25: {
    type: 'concrete',
    grade: 'C25/30',
    fck: 25,
    fcd: 25 / 1.5,
    E: 3250 * Math.sqrt(25) + 14000, // 30250 MPa
    G: (3250 * Math.sqrt(25) + 14000) / (2 * 1.15),
    nu: 0.15,
    alpha: 1e-5,
    gamma: 24,
    tensileStrength: 2.0,
  },
  C30: {
    type: 'concrete',
    grade: 'C30/37',
    fck: 30,
    fcd: 30 / 1.5,
    E: 3250 * Math.sqrt(30) + 14000, // 31798 MPa
    G: (3250 * Math.sqrt(30) + 14000) / (2 * 1.15),
    nu: 0.15,
    alpha: 1e-5,
    gamma: 24,
    tensileStrength: 2.2,
  },
  C35: {
    type: 'concrete',
    grade: 'C35/45',
    fck: 35,
    fcd: 35 / 1.5,
    E: 3250 * Math.sqrt(35) + 14000, // 33223 MPa
    G: (3250 * Math.sqrt(35) + 14000) / (2 * 1.15),
    nu: 0.15,
    alpha: 1e-5,
    gamma: 24,
    tensileStrength: 2.5,
  },
  C40: {
    type: 'concrete',
    grade: 'C40/50',
    fck: 40,
    fcd: 40 / 1.5,
    E: 3250 * Math.sqrt(40) + 14000, // 34553 MPa
    G: (3250 * Math.sqrt(40) + 14000) / (2 * 1.15),
    nu: 0.15,
    alpha: 1e-5,
    gamma: 24,
    tensileStrength: 2.7,
  },
  C45: {
    type: 'concrete',
    grade: 'C45/55',
    fck: 45,
    fcd: 45 / 1.5,
    E: 3250 * Math.sqrt(45) + 14000, // 35791 MPa
    G: (3250 * Math.sqrt(45) + 14000) / (2 * 1.15),
    nu: 0.15,
    alpha: 1e-5,
    gamma: 24,
    tensileStrength: 2.9,
  },
  C50: {
    type: 'concrete',
    grade: 'C50/60',
    fck: 50,
    fcd: 50 / 1.5,
    E: 3250 * Math.sqrt(50) + 14000, // 36970 MPa
    G: (3250 * Math.sqrt(50) + 14000) / (2 * 1.15),
    nu: 0.15,
    alpha: 1e-5,
    gamma: 24,
    tensileStrength: 3.1,
  },
};

// ============================================================================
// STEEL MATERIALS (TS 708, TS 648)
// ============================================================================

/**
 * Donatı çeliği elastisite modülü - TS 500
 * Es = 200000 MPa (sabit)
 */
export const STEEL_MODULUS = 200000; // MPa

export const STEEL_MATERIALS: Record<string, SteelMaterial> = {
  S220: {
    type: 'steel',
    grade: 'S220',
    fyk: 220, // Akma dayanımı (MPa)
    fyd: 220 / 1.15, // γs = 1.15 (TS 500)
    fuk: 340, // Çekme dayanımı (MPa)
    E: STEEL_MODULUS,
    G: STEEL_MODULUS / (2 * (1 + 0.3)), // ν = 0.3
    nu: 0.3,
    alpha: 1.2e-5, // 12 × 10⁻⁶ /°C
    gamma: 78.5, // kN/m³
  },
  S420: {
    type: 'steel',
    grade: 'S420',
    fyk: 420,
    fyd: 420 / 1.15,
    fuk: 500,
    E: STEEL_MODULUS,
    G: STEEL_MODULUS / (2 * (1 + 0.3)),
    nu: 0.3,
    alpha: 1.2e-5,
    gamma: 78.5,
  },
  S500: {
    type: 'steel',
    grade: 'S500',
    fyk: 500,
    fyd: 500 / 1.15,
    fuk: 600,
    E: STEEL_MODULUS,
    G: STEEL_MODULUS / (2 * (1 + 0.3)),
    nu: 0.3,
    alpha: 1.2e-5,
    gamma: 78.5,
  },
  // Yapı çeliği (TS 648)
  St37: {
    type: 'steel',
    grade: 'St37',
    fyk: 235,
    fyd: 235 / 1.15,
    fuk: 360,
    E: 210000, // Çelik için E = 210 GPa
    G: 210000 / (2 * (1 + 0.3)),
    nu: 0.3,
    alpha: 1.2e-5,
    gamma: 78.5,
  },
  St44: {
    type: 'steel',
    grade: 'St44',
    fyk: 275,
    fyd: 275 / 1.15,
    fuk: 430,
    E: 210000,
    G: 210000 / (2 * (1 + 0.3)),
    nu: 0.3,
    alpha: 1.2e-5,
    gamma: 78.5,
  },
  St52: {
    type: 'steel',
    grade: 'St52',
    fyk: 355,
    fyd: 355 / 1.15,
    fuk: 510,
    E: 210000,
    G: 210000 / (2 * (1 + 0.3)),
    nu: 0.3,
    alpha: 1.2e-5,
    gamma: 78.5,
  },
};

// ============================================================================
// TIMBER MATERIALS (Ahşap)
// ============================================================================

export const TIMBER_MATERIALS: Record<string, TimberMaterial> = {
  Pine: {
    type: 'timber',
    grade: 'Çam',
    fck: 20, // Basınç dayanımı (MPa)
    ft: 12,  // Çekme dayanımı (MPa)
    E: 11000, // Elastisite modülü (MPa)
    G: 11000 / (2 * (1 + 0.35)),
    nu: 0.35,
    alpha: 5e-6, // 5 × 10⁻⁶ /°C
    gamma: 5, // kN/m³ (nemli durumda)
  },
  Oak: {
    type: 'timber',
    grade: 'Meşe',
    fck: 35,
    ft: 25,
    E: 14000,
    G: 14000 / (2 * (1 + 0.35)),
    nu: 0.35,
    alpha: 4e-6,
    gamma: 7,
  },
  Beech: {
    type: 'timber',
    grade: 'Kayın',
    fck: 45,
    ft: 30,
    E: 16000,
    G: 16000 / (2 * (1 + 0.35)),
    nu: 0.35,
    alpha: 5e-6,
    gamma: 7.5,
  },
  Spruce: {
    type: 'timber',
    grade: 'Ladin',
    fck: 25,
    ft: 15,
    E: 12000,
    G: 12000 / (2 * (1 + 0.35)),
    nu: 0.35,
    alpha: 5e-6,
    gamma: 4.5,
  },
};

// ============================================================================
// ALUMINUM MATERIALS
// ============================================================================

export const ALUMINUM_MATERIALS: Record<string, AluminumMaterial> = {
  Al6061_T6: {
    type: 'aluminum',
    grade: 'Al 6061-T6',
    fy: 240, // Akma dayanımı (MPa)
    E: 69000, // Elastisite modülü (MPa)
    G: 69000 / (2 * (1 + 0.33)),
    nu: 0.33,
    alpha: 2.3e-5, // 23 × 10⁻⁶ /°C
    gamma: 27, // kN/m³
  },
  Al7075_T6: {
    type: 'aluminum',
    grade: 'Al 7075-T6',
    fy: 503,
    E: 71000,
    G: 71000 / (2 * (1 + 0.33)),
    nu: 0.33,
    alpha: 2.3e-5,
    gamma: 28,
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Malzeme seçimi (tüm malzemeler)
export function getAllMaterials(): Material[] {
  return [
    ...Object.values(CONCRETE_MATERIALS),
    ...Object.values(STEEL_MATERIALS),
    ...Object.values(TIMBER_MATERIALS),
    ...Object.values(ALUMINUM_MATERIALS),
  ];
}

// Malzeme tiplerine göre filtreleme
export function getMaterialsByType(type: MaterialType): Material[] {
  switch (type) {
    case 'concrete':
      return Object.values(CONCRETE_MATERIALS);
    case 'steel':
      return Object.values(STEEL_MATERIALS);
    case 'timber':
      return Object.values(TIMBER_MATERIALS);
    case 'aluminum':
      return Object.values(ALUMINUM_MATERIALS);
    default:
      return [];
  }
}

// Grade ile malzeme bulma
export function getMaterialByGrade(grade: string): Material | undefined {
  // Tüm veritabanlarını ara
  const all = getAllMaterials();
  return all.find(m => (m as any).grade === grade);
}

// Beton sınıfı listesi
export function getConcreteGrades(): string[] {
  return Object.keys(CONCRETE_MATERIALS);
}

// Çelik sınıfı listesi
export function getSteelGrades(): string[] {
  return Object.keys(STEEL_MATERIALS);
}

// ============================================================================
// CALCULATION HELPERS
// ============================================================================

/**
 * Basınç dayanımı kontrolü
 * σd ≤ fcd / γm
 */
export function checkCompressiveStress(
  stress: number,  // MPa
  material: Material
): { isSafe: boolean; ratio: number; limit: number } {
  if (material.type === 'concrete') {
    const limit = material.fcd;
    return {
      isSafe: stress <= limit,
      ratio: stress / limit,
      limit,
    };
  } else if (material.type === 'steel') {
    const limit = material.fyd;
    return {
      isSafe: stress <= limit,
      ratio: stress / limit,
      limit,
    };
  } else if (material.type === 'aluminum') {
    const limit = material.fy / 1.1; // γM = 1.1
    return {
      isSafe: stress <= limit,
      ratio: stress / limit,
      limit,
    };
  } else {
    const limit = material.fck / 1.3;
    return {
      isSafe: stress <= limit,
      ratio: stress / limit,
      limit,
    };
  }
}

/**
 * Eğilme dayanımı kontrolü
 * σ = M / W ≤ fyd
 */
export function checkBendingStress(
  moment: number,     // kNm
  sectionModulus: number, // mm³
  material: Material
): { stress: number; isSafe: boolean; ratio: number } {
  // Stress = M * 10⁶ / W (MPa)
  const stress = (moment * 1e6) / sectionModulus;

  let limit: number;
  if (material.type === 'steel') {
    limit = material.fyd;
  } else if (material.type === 'aluminum') {
    limit = material.fy / 1.1;
  } else if (material.type === 'concrete') {
    limit = material.fcd;
  } else {
    limit = material.ft / 1.3;
  }

  return {
    stress,
    isSafe: stress <= limit,
    ratio: stress / limit,
  };
}

/**
 * Gerilme birimi hesabı: ε = σ / E
 */
export function calculateStrain(stress: number, E: number): number {
  return stress / E;
}

/**
 * Hidrostatik basınç için birim ağırlık hesabı
 * γ = ρ × g
 */
export function calculateUnitWeight(density: number): number {
  // density: kg/m³ → kN/m³
  return density * 9.81 / 1000;
}

/**
 * Sıcaklık değişimine göre uzama
 * ΔL = L × α × ΔT
 */
export function calculateThermalExpansion(
  length: number,  // m
  alpha: number,   // 1/°C
  deltaT: number   // °C
): number {
  // mm cinsinden
  return length * 1000 * alpha * deltaT;
}

// ============================================================================
// PRESET COMBINATIONS
// ============================================================================

export const MATERIAL_PRESETS: Record<string, Material> = {
  'rc-C30-S420': {
    ...CONCRETE_MATERIALS.C30,
  },
  'steel-St37': {
    ...STEEL_MATERIALS.St37,
  },
  'steel-St44': {
    ...STEEL_MATERIALS.St44,
  },
  'timber-pine': {
    ...TIMBER_MATERIALS.Pine,
  },
};

export const MATERIAL_LABELS: Record<string, string> = {
  'rc-C30-S420': 'Betonarme C30 + S420 Donatı',
  'steel-St37': 'Yapı Çeliği St37',
  'steel-St44': 'Yapı Çeliği St44',
  'timber-pine': 'Çam Ahşap',
};
