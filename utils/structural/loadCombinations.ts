// ============================================================================
// LOAD COMBINATIONS - TS 498 Yük Kombinasyonları
// Yapı Elemanlarının Boyutlandırılmasında Alınacak Yüklerin Hesap Değerleri
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export type LoadCaseType =
  | 'dead'         // Ölü yük (G)
  | 'live'         // Hareketli yük (Q)
  | 'wind'         // Rüzgar yükü (W)
  | 'snow'         // Kar yükü (S)
  | 'seismic'      // Deprem yükü (E)
  | 'thermal';     // Isıl yük (T)

export interface LoadCase {
  name: string;        // Türkçe ad
  type: LoadCaseType;
  characteristicValue: number; // kN veya kN/m²
  description: string;
}

export interface LoadCombination {
  id: string;
  name: string;        // Türkçe ad
  formula: string;     // Kombinasyon formülü
  loads: {
    [key: string]: number; // Yük katsayıları
  };
  description: string;
  isUltimate: boolean; // GK (Güvenlik Katsayılı) / DK (Durum Katsayılı)
}

export interface CombinationResult {
  id: string;
  name: string;
  value: number;       // kN
  loads: {
    [key: string]: { value: number; factor: number; };
  };
}

// ============================================================================
// TS 498 YÜK KOMBİNASYONLARI
// ============================================================================

/**
 * TS 498'e göre yük kombinasyon faktörleri
 *
 * GK (Güvenlik Katsayılı) - Sonlu durum:
 * 1.4G + 1.6Q (veya 1.35G + 1.5Q - Eurocode benzeri)
 * 1.2G + 1.2Q + 1.4W (rüzgarlı)
 *
 * DK (Durum Katsayılı) - Hizmet sınırı:
 * G + Q
 * G + 0.6Q + W
 */

export const LOAD_FACTORS_TS498 = {
  // Güvenlik katsayıları (γ)
  dead_load_ultimate: 1.35,    // γG (ölü yük - nihai durum)
  live_load_ultimate: 1.5,     // γQ (hareketli yük - nihai durum)
  wind_load_ultimate: 1.5,     // γW (rüzgâr - nihai durum)
  snow_load_ultimate: 1.5,     // γS (kar - nihai durum)

  // Durum katsayıları (ψ) - Hizmet sınırı
  dead_load_service: 1.0,
  live_load_service: 1.0,
  wind_load_service: 0.6,      // ψ₀ (kısa süreli)
  snow_load_service: 0.5,      // ψ₀ (kısa süreli)

  // Deprem katsayıları
  seismic_reduction: 0.3,      // R (davranış katsayısı)
};

// ============================================================================
// STANDART KOMBİNASYONLAR
// ============================================================================

export const STANDARD_COMBINATIONS: LoadCombination[] = [
  // NİHAİ DURUM (ULS - Ultimate Limit State)
  {
    id: 'ULS-1',
    name: '1.35G + 1.5Q',
    formula: '1.35 × G + 1.5 × Q',
    loads: { G: 1.35, Q: 1.5 },
    description: 'Ölü + Hareketli (Güvenlik katsayılı)',
    isUltimate: true,
  },
  {
    id: 'ULS-2',
    name: '1.35G + 1.5Q + 1.5W',
    formula: '1.35 × G + 1.5 × Q + 1.5 × W',
    loads: { G: 1.35, Q: 1.5, W: 1.5 },
    description: 'Ölü + Hareketli + Rüzgar',
    isUltimate: true,
  },
  {
    id: 'ULS-3',
    name: '1.35G + 1.5W',
    formula: '1.35 × G + 1.5 × W',
    loads: { G: 1.35, W: 1.5 },
    description: 'Ölü + Rüzgar (hareketsiz)',
    isUltimate: true,
  },
  {
    id: 'ULS-4',
    name: '1.0G + 1.5Q',
    formula: '1.0 × G + 1.5 × Q',
    loads: { G: 1.0, Q: 1.5 },
    description: 'Ölü (ters) + Hareketli',
    isUltimate: true,
  },
  {
    id: 'ULS-5',
    name: '1.35G + 1.5S',
    formula: '1.35 × G + 1.5 × S',
    loads: { G: 1.35, S: 1.5 },
    description: 'Ölü + Kar',
    isUltimate: true,
  },
  {
    id: 'ULS-6',
    name: '1.35G + 1.5Q + 1.5S',
    formula: '1.35 × G + 1.5 × Q + 1.5 × S',
    loads: { G: 1.35, Q: 1.5, S: 1.5 },
    description: 'Ölü + Hareketli + Kar',
    isUltimate: true,
  },
  {
    id: 'ULS-seismic',
    name: 'G + Q + E',
    formula: '1.0 × G + 0.3 × Q + 1.0 × E',
    loads: { G: 1.0, Q: 0.3, E: 1.0 },
    description: 'Ölü + Hareketli (kısmi) + Deprem',
    isUltimate: true,
  },

  // HİZMET SINIRI (SLS - Serviceability Limit State)
  {
    id: 'SLS-1',
    name: 'G + Q',
    formula: '1.0 × G + 1.0 × Q',
    loads: { G: 1.0, Q: 1.0 },
    description: 'Ölü + Hareketli (Karakteristik)',
    isUltimate: false,
  },
  {
    id: 'SLS-2',
    name: 'G + 0.6Q + W',
    formula: '1.0 × G + 0.6 × Q + 1.0 × W',
    loads: { G: 1.0, Q: 0.6, W: 1.0 },
    description: 'Ölü + Hareketli (kısmi) + Rüzgar',
    isUltimate: false,
  },
  {
    id: 'SLS-3',
    name: 'G + 0.5S',
    formula: '1.0 × G + 0.5 × S',
    loads: { G: 1.0, S: 0.5 },
    description: 'Ölü + Kar (kısmi)',
    isUltimate: false,
  },
  {
    id: 'SLS-rare',
    name: 'G + Q + W',
    formula: '1.0 × G + 0.7 × Q + 0.5 × W',
    loads: { G: 1.0, Q: 0.7, W: 0.5 },
    description: 'Nadir durum kombinasyonu',
    isUltimate: false,
  },
];

// Türkçe açıklamalar
export const LOAD_TYPE_NAMES: Record<LoadCaseType, { name: string; symbol: string; description: string }> = {
  dead: {
    name: 'Ölü Yük',
    symbol: 'G',
    description: 'Yapı ağırlığı, sabit yükler (kN/m²)',
  },
  live: {
    name: 'Hareketli Yük',
    symbol: 'Q',
    description: 'İnsan, eşya, taşınabilir yükler (kN/m²)',
  },
  wind: {
    name: 'Rüzgar Yükü',
    symbol: 'W',
    description: 'Rüzgar basıncı (kN/m²)',
  },
  snow: {
    name: 'Kar Yükü',
    symbol: 'S',
    description: 'Çatı kar yükü (kN/m²)',
  },
  seismic: {
    name: 'Deprem Yükü',
    symbol: 'E',
    description: 'Sismik yük etkisi (kN)',
  },
  thermal: {
    name: 'Isıl Yük',
    symbol: 'T',
    description: 'Sıcaklık değişimi (°C)',
  },
};

// ============================================================================
// TS 498 KARAKTERİSTİK YÜK DEĞERLERİ
// ============================================================================

/**
 * TS 498 Tablo 1 - Düzgün yayılı düşey hareketli yük
 */
export const LIVE_LOADS_TS498: Record<string, { name: string; value: number; unit: string }> = {
  // Konut ve iş yeri
  'housing-rooms': { name: 'Konut Odaları', value: 1.5, unit: 'kN/m²' },
  'housing-corridors': { name: 'Konut Koridorları', value: 2.0, unit: 'kN/m²' },
  'housing-stairs': { name: 'Konut Merdivenleri', value: 3.0, unit: 'kN/m²' },
  'housing-balcony': { name: 'Konut Balkonlar', value: 3.5, unit: 'kN/m²' },
  'housing-roof': { name: 'Konut Çatılar (Erişilebilir)', value: 1.0, unit: 'kN/m²' },

  // Ticari yapılar
  'office-rooms': { name: 'Ofis Odaları', value: 2.0, unit: 'kN/m²' },
  'office-corridors': { name: 'Ofis Koridorları', value: 3.0, unit: 'kN/m²' },
  'office-stairs': { name: 'Ofis Merdivenleri', value: 4.0, unit: 'kN/m²' },
  'archive': { name: 'Arşiv', value: 7.5, unit: 'kN/m²' },

  // Eğlence yapıları
  'cinema-seats': { name: 'Sinema Koltukları', value: 4.0, unit: 'kN/m²' },
  'dance-hall': { name: 'Dans Salonu', value: 5.0, unit: 'kN/m²' },
  'grandstand': { name: 'Tribün', value: 5.0, unit: 'kN/m²' },

  // Garaj ve otopark
  'garage-vehicles': { name: 'Otopark (Araç)', value: 2.5, unit: 'kN/m²' },
  'garage-maintenance': { name: 'Bakım Garajı', value: 5.0, unit: 'kN/m²' },
};

/**
 * TS 498 Rüzgar yükü - q = Cf × qref
 * Yapı yüksekliği < 8m için q = 0.50 kN/m²
 */
export const WIND_LOADS_TS498: Record<string, { height: number; q_basic: number }> = {
  'h-8': { height: 8, q_basic: 0.50 }, // kN/m²
  'h-10': { height: 10, q_basic: 0.60 },
  'h-20': { height: 20, q_basic: 0.80 },
  'h-30': { height: 30, q_basic: 0.95 },
  'h-50': { height: 50, q_basic: 1.15 },
};

/**
 * TS 498 Kar yükü - sk = sk₀ × Ce
 */
export const SNOW_LOADS_TS498: Record<string, { altitude: number; sk0: number }> = {
  'sea-level': { altitude: 0, sk0: 0.75 }, // kN/m², deniz seviyesi
  'altitude-500': { altitude: 500, sk0: 1.00 },
  'altitude-1000': { altitude: 1000, sk0: 1.50 },
  'altitude-1500': { altitude: 1500, sk0: 2.00 },
};

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

/**
 * Yük kombinasyonu hesapla
 */
export function calculateCombination(
  combination: LoadCombination,
  loads: { [key: string]: number }
): CombinationResult {
  let total = 0;
  const resultLoads: {
    [key: string]: { value: number; factor: number; };
  } = {};

  for (const [key, factor] of Object.entries(combination.loads)) {
    const value = loads[key] ?? 0;
    const contribution = value * factor;
    total += contribution;
    resultLoads[key] = { value, factor };
  }

  return {
    id: combination.id,
    name: combination.name,
    value: total,
    loads: resultLoads,
  };
}

/**
 * Tüm kombinasyonları hesapla
 */
export function calculateAllCombinations(
  loads: { [key: string]: number }
): CombinationResult[] {
  return STANDARD_COMBINATIONS.map(combo => calculateCombination(combo, loads));
}

/**
 * En kritik kombinasyonu bul
 */
export function findCriticalCombination(
  loads: { [key: string]: number },
  isMax: boolean = true
): CombinationResult | null {
  const results = calculateAllCombinations(loads);

  if (results.length === 0) return null;

  return results.reduce((critical, current) => {
    if (isMax) {
      return current.value > critical.value ? current : critical;
    } else {
      return current.value < critical.value ? current : critical;
    }
  });
}

/**
 * Kombinasyon oranı hesapla (R/design)
 */
export function calculateUtilizationRatio(
  load: number,
  resistance: number
): { ratio: number; isSafe: boolean; percentage: string } {
  const ratio = Math.abs(load) / resistance;
  return {
    ratio,
    isSafe: ratio <= 1.0,
    percentage: `${(ratio * 100).toFixed(1)}%`,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Rüzgar yükü hesapla (basit yaklaşım)
 */
export function calculateWindLoad(
  buildingHeight: number, // m
  Cf: number = 1.0        // Şekil katsayısı
): number {
  // Yüksekliğe göre interpolasyon
  const heights = Object.values(WIND_LOADS_TS498)
    .map(h => h.height)
    .sort((a, b) => a - b);

  let q_basic = WIND_LOADS_TS498['h-8'].q_basic;

  for (let i = 0; i < heights.length - 1; i++) {
    if (buildingHeight >= heights[i] && buildingHeight <= heights[i + 1]) {
      // Linear interpolasyon
      const q1 = Object.values(WIND_LOADS_TS498)[i].q_basic;
      const q2 = Object.values(WIND_LOADS_TS498)[i + 1].q_basic;
      const h1 = heights[i];
      const h2 = heights[i + 1];
      q_basic = q1 + (q2 - q1) * (buildingHeight - h1) / (h2 - h1);
      break;
    }
  }

  if (buildingHeight > heights[heights.length - 1]) {
    q_basic = Object.values(WIND_LOADS_TS498)[Object.values(WIND_LOADS_TS498).length - 1].q_basic;
  }

  return Cf * q_basic;
}

/**
 * Kar yükü hesapla (basit yaklaşım - TS 498)
 */
export function calculateSnowLoad(
  altitude: number, // m
  Ce: number = 1.0   // Maruz kalma katsayısı
): number {
  const sk0 = Math.max(0.75, 0.75 + altitude * 0.0015); // Basit yaklaşım
  return Ce * sk0;
}

/**
 * Toplam ölü yük hesapla
 */
export function calculateDeadLoad(
  concreteVolume: number,  // m³
  steelVolume: number,     // m³
  otherWeight: number = 0  // kN
): number {
  const concreteWeight = concreteVolume * 24; // kN/m³
  const steelWeight = steelVolume * 78.5;    // kN/m³
  return concreteWeight + steelWeight + otherWeight;
}

// ============================================================================
// PUBLIC API
// ============================================================================

export function getStandardCombination(id: string): LoadCombination | undefined {
  return STANDARD_COMBINATIONS.find(c => c.id === id);
}

export function getUltimateCombinations(): LoadCombination[] {
  return STANDARD_COMBINATIONS.filter(c => c.isUltimate);
}

export function getServiceabilityCombinations(): LoadCombination[] {
  return STANDARD_COMBINATIONS.filter(c => !c.isUltimate);
}

export function getLoadTypeName(type: LoadCaseType): string {
  return LOAD_TYPE_NAMES[type].name;
}

export function getLiveLoadValue(key: string): number | undefined {
  return LIVE_LOADS_TS498[key]?.value;
}
