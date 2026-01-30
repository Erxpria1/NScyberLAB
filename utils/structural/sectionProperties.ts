// ============================================================================
// SECTION PROPERTIES CALCULATOR - Kesit Özellikleri Hesaplama Motoru
// Atalet momenti (I), Kesit modülü (W), Dönüş yarıçapı (r)
// TS 500 ve Eurocode 3 standartlarına uygun
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export type SectionShape =
  | 'rectangle'    // Dikdörtgen
  | 'circle'       // Daire
  | 'triangle'     // Üçgen
  | 'i-beam'       // I Profil
  | 't-beam'       // T Profil
  | 'l-beam'       // L Profil (açık kenar)
  | 'box'          // Kutu profil
  | 'pipe';        // Boru

export interface RectangleSection {
  shape: 'rectangle';
  width: number;   // mm (b)
  height: number;  // mm (h)
}

export interface CircleSection {
  shape: 'circle';
  diameter: number; // mm (D)
}

export interface TriangleSection {
  shape: 'triangle';
  base: number;   // mm (b)
  height: number; // mm (h)
}

export interface IBeamSection {
  shape: 'i-beam';
  height: number;   // mm (h) - toplam yükseklik
  flangeWidth: number; // mm (bf) - başlık genişliği
  flangeThickness: number; // mm (tf) - başlık kalınlığı
  webThickness: number; // mm (tw) - gövde kalınlığı
}

export interface TBeamSection {
  shape: 't-beam';
  height: number;   // mm (h)
  flangeWidth: number; // mm (bf)
  flangeThickness: number; // mm (tf)
  webThickness: number; // mm (tw)
}

export interface LBeamSection {
  shape: 'l-beam';
  height: number;   // mm (h)
  width: number;    // mm (b)
  thickness: number; // mm (t) - kalınlık
}

export interface BoxSection {
  shape: 'box';
  height: number;   // mm (h)
  width: number;    // mm (b)
  thickness: number; // mm (t)
}

export interface PipeSection {
  shape: 'pipe';
  outerDiameter: number; // mm (D)
  wallThickness: number; // mm (t)
}

export type SectionInput =
  | RectangleSection
  | CircleSection
  | TriangleSection
  | IBeamSection
  | TBeamSection
  | LBeamSection
  | BoxSection
  | PipeSection;

export interface SectionProperties {
  area: number;        // mm² (A)
  iy: number;          // mm⁴ (Iy - y ekseni etrafında atalet momenti)
  iz: number;          // mm⁴ (Iz - z ekseni etrafında atalet momenti)
  wy: number;          // mm³ (Wy - y ekseni kesit modülü)
  wz: number;          // mm³ (Wz - z ekseni kesit modülü)
  ry: number;          // mm (ry - y ekseni dönüş yarıçapı)
  rz: number;          // mm (rz - z ekseni dönüş yarıçapı)
  centroidY: number;   // mm - centroid y pozisyonu
  centroidZ: number;   // mm - centroid z pozisyonu
}

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

// Dikdörtgen kesit
function calcRectangle(input: RectangleSection): SectionProperties {
  const { width, height } = input;
  const area = width * height;

  // Iy = b * h³ / 12
  const iy = (width * Math.pow(height, 3)) / 12;

  // Iz = h * b³ / 12
  const iz = (height * Math.pow(width, 3)) / 12;

  // Wy = Iy / (h/2)
  const wy = iy / (height / 2);

  // Wz = Iz / (b/2)
  const wz = iz / (width / 2);

  // r = √(I/A)
  const ry = Math.sqrt(iy / area);
  const rz = Math.sqrt(iz / area);

  return {
    area,
    iy,
    iz,
    wy,
    wz,
    ry,
    rz,
    centroidY: height / 2,
    centroidZ: width / 2,
  };
}

// Daire kesit
function calcCircle(input: CircleSection): SectionProperties {
  const { diameter } = input;
  const radius = diameter / 2;

  // A = π * r²
  const area = Math.PI * radius * radius;

  // I = π * r⁴ / 4 (tüm eksenler için simetrik)
  const iy = (Math.PI * Math.pow(radius, 4)) / 4;
  const iz = iy;

  // W = I / r = π * r³ / 4
  const wy = iy / radius;
  const wz = wy;

  // r = √(I/A) = r/2
  const ry = radius / 2;
  const rz = ry;

  return {
    area,
    iy,
    iz,
    wy,
    wz,
    ry,
    rz,
    centroidY: radius,
    centroidZ: radius,
  };
}

// Üçgen kesit
function calcTriangle(input: TriangleSection): SectionProperties {
  const { base, height } = input;

  // A = b * h / 2
  const area = (base * height) / 2;

  // Iy (base parallel to y axis) = b * h³ / 36
  const iy = (base * Math.pow(height, 3)) / 36;

  // Iz = h * b³ / 48
  const iz = (height * Math.pow(base, 3)) / 48;

  // Wy = Iy / (2h/3)
  const wy = iy / (2 * height / 3);

  // Wz = Iz / (b/2)
  const wz = iz / (base / 2);

  const ry = Math.sqrt(iy / area);
  const rz = Math.sqrt(iz / area);

  return {
    area,
    iy,
    iz,
    wy,
    wz,
    ry,
    rz,
    centroidY: height / 3,
    centroidZ: base / 2,
  };
}

// I Profil (NP tipi çelik profil)
function calcIBeam(input: IBeamSection): SectionProperties {
  const { height, flangeWidth, flangeThickness, webThickness } = input;

  // İziyel formülasyon: A = 2 * bf * tf + hw * tw
  const hw = height - 2 * flangeThickness;
  const area = 2 * flangeWidth * flangeThickness + hw * webThickness;

  // Iy hesabı (basit yaklaşım - gövde + başlıklar)
  // Başlıkların atalet momenti: 2 * [bf * tf³/12 + bf * tf * (h/2 - tf/2)²]
  const flangeIy = 2 * (
    (flangeWidth * Math.pow(flangeThickness, 3)) / 12 +
    flangeWidth * flangeThickness * Math.pow(height / 2 - flangeThickness / 2, 2)
  );

  // Gövdenin atalet momenti: tw * hw³ / 12
  const webIy = (webThickness * Math.pow(hw, 3)) / 12;

  const iy = flangeIy + webIy;

  // Iz hesabı (z ekseni - simetri ekseni)
  // Iz ≈ 2 * tf * bf³/12 + hw * tw³/12
  const iz = 2 * (flangeThickness * Math.pow(flangeWidth, 3)) / 12 +
              (hw * Math.pow(webThickness, 3)) / 12;

  const wy = iy / (height / 2);
  const wz = iz / (flangeWidth / 2);

  const ry = Math.sqrt(iy / area);
  const rz = Math.sqrt(iz / area);

  return {
    area,
    iy,
    iz,
    wy,
    wz,
    ry,
    rz,
    centroidY: height / 2,
    centroidZ: flangeWidth / 2,
  };
}

// T Profil
function calcTBeam(input: TBeamSection): SectionProperties {
  const { height, flangeWidth, flangeThickness, webThickness } = input;

  const hw = height - flangeThickness;
  const area = flangeWidth * flangeThickness + hw * webThickness;

  // Centroid hesabı (alttan)
  const yFlange = hw + flangeThickness / 2;
  const yWeb = hw / 2;
  const centroidY = (flangeWidth * flangeThickness * yFlange + webThickness * hw * yWeb) / area;

  // Iy hesabı (paralel eksen teoremi ile)
  const flangeIy_self = (flangeWidth * Math.pow(flangeThickness, 3)) / 12;
  const flangeIy = flangeIy_self + flangeWidth * flangeThickness * Math.pow(yFlange - centroidY, 2);

  const webIy_self = (webThickness * Math.pow(hw, 3)) / 12;
  const webIy = webIy_self + webThickness * hw * Math.pow(centroidY - yWeb, 2);

  const iy = flangeIy + webIy;

  // Iz (yatay eksen)
  const iz = (flangeThickness * Math.pow(flangeWidth, 3)) / 12 +
             (hw * Math.pow(webThickness, 3)) / 12;

  const wy = Math.max(iy / centroidY, iy / (height - centroidY));
  const wz = iz / (flangeWidth / 2);

  const ry = Math.sqrt(iy / area);
  const rz = Math.sqrt(iz / area);

  return {
    area,
    iy,
    iz,
    wy,
    wz,
    ry,
    rz,
    centroidY,
    centroidZ: flangeWidth / 2,
  };
}

// L Profil (Açık Kenar)
function calcLBeam(input: LBeamSection): SectionProperties {
  const { height, width, thickness } = input;

  const area = thickness * (height + width - thickness);

  // Centroid hesabı
  const A1 = thickness * height; // dikey parça
  const A2 = thickness * (width - thickness); // yatay parça
  const y1 = height / 2;
  const y2 = thickness / 2;
  const z1 = thickness / 2;
  const z2 = thickness + (width - thickness) / 2;

  const centroidY = (A1 * y1 + A2 * y2) / area;
  const centroidZ = (A1 * z1 + A2 * z2) / area;

  // Iy hesabı
  const I1y = (thickness * Math.pow(height, 3)) / 12 + A1 * Math.pow(y1 - centroidY, 2);
  const I2y = ((width - thickness) * Math.pow(thickness, 3)) / 12 + A2 * Math.pow(y2 - centroidY, 2);
  const iy = I1y + I2y;

  // Iz hesabı
  const I1z = (height * Math.pow(thickness, 3)) / 12 + A1 * Math.pow(z1 - centroidZ, 2);
  const I2z = (thickness * Math.pow(width - thickness, 3)) / 12 + A2 * Math.pow(z2 - centroidZ, 2);
  const iz = I1z + I2z;

  const wy = Math.max(iy / centroidY, iy / (height - centroidY));
  const wz = Math.max(iz / centroidZ, iz / (width - centroidZ));

  const ry = Math.sqrt(iy / area);
  const rz = Math.sqrt(iz / area);

  return {
    area,
    iy,
    iz,
    wy,
    wz,
    ry,
    rz,
    centroidY,
    centroidZ,
  };
}

// Kutu Profil (Kare/Dikdörtgen BOŞ)
function calcBox(input: BoxSection): SectionProperties {
  const { height, width, thickness } = input;

  const h_inner = height - 2 * thickness;
  const w_inner = width - 2 * thickness;

  const area = height * width - h_inner * w_inner;

  // Iy = (B*H³ - b*h³) / 12
  const iy = (width * Math.pow(height, 3) - w_inner * Math.pow(h_inner, 3)) / 12;

  // Iz = (H*B³ - h*b³) / 12
  const iz = (height * Math.pow(width, 3) - h_inner * Math.pow(w_inner, 3)) / 12;

  const wy = iy / (height / 2);
  const wz = iz / (width / 2);

  const ry = Math.sqrt(iy / area);
  const rz = Math.sqrt(iz / area);

  return {
    area,
    iy,
    iz,
    wy,
    wz,
    ry,
    rz,
    centroidY: height / 2,
    centroidZ: width / 2,
  };
}

// Boru Kesit
function calcPipe(input: PipeSection): SectionProperties {
  const { outerDiameter, wallThickness } = input;

  const outerRadius = outerDiameter / 2;
  const innerRadius = outerRadius - wallThickness;

  const area = Math.PI * (outerRadius * outerRadius - innerRadius * innerRadius);

  // I = π * (R⁴ - r⁴) / 4
  const iy = (Math.PI * (Math.pow(outerRadius, 4) - Math.pow(innerRadius, 4))) / 4;
  const iz = iy;

  const wy = iy / outerRadius;
  const wz = wy;

  const ry = Math.sqrt(iy / area);
  const rz = ry;

  return {
    area,
    iy,
    iz,
    wy,
    wz,
    ry,
    rz,
    centroidY: outerRadius,
    centroidZ: outerRadius,
  };
}

// ============================================================================
// MAIN CALCULATION FUNCTION
// ============================================================================

export function calculateSectionProperties(input: SectionInput): SectionProperties {
  switch (input.shape) {
    case 'rectangle':
      return calcRectangle(input);
    case 'circle':
      return calcCircle(input);
    case 'triangle':
      return calcTriangle(input);
    case 'i-beam':
      return calcIBeam(input);
    case 't-beam':
      return calcTBeam(input);
    case 'l-beam':
      return calcLBeam(input);
    case 'box':
      return calcBox(input);
    case 'pipe':
      return calcPipe(input);
    default:
      throw new Error(`Bilinmeyen kesit şekli: ${(input as any).shape}`);
  }
}

// ============================================================================
// STANDARD PROFILES DATABASE (Türçe Çelik Profilleri)
// ============================================================================

export interface StandardProfile {
  code: string;      // Profil kodu (örn: NP_200)
  name: string;      // Profil adı
  shape: SectionShape;
  dimensions: Record<string, number>;
  properties: SectionProperties;
}

// NP (Normal Profil) I-profilleri - TS 145
export const NP_PROFILES: StandardProfile[] = [
  {
    code: 'NP_100',
    name: 'NP 100 I-Profil',
    shape: 'i-beam',
    dimensions: { height: 100, flangeWidth: 55, flangeThickness: 5.7, webThickness: 4.1 },
    properties: {} as SectionProperties,
  },
  {
    code: 'NP_120',
    name: 'NP 120 I-Profil',
    shape: 'i-beam',
    dimensions: { height: 120, flangeWidth: 64, flangeThickness: 6.3, webThickness: 4.4 },
    properties: {} as SectionProperties,
  },
  {
    code: 'NP_140',
    name: 'NP 140 I-Profil',
    shape: 'i-beam',
    dimensions: { height: 140, flangeWidth: 73, flangeThickness: 6.9, webThickness: 4.7 },
    properties: {} as SectionProperties,
  },
  {
    code: 'NP_160',
    name: 'NP 160 I-Profil',
    shape: 'i-beam',
    dimensions: { height: 160, flangeWidth: 82, flangeThickness: 7.4, webThickness: 5.0 },
    properties: {} as SectionProperties,
  },
  {
    code: 'NP_180',
    name: 'NP 180 I-Profil',
    shape: 'i-beam',
    dimensions: { height: 180, flangeWidth: 91, flangeThickness: 8.0, webThickness: 5.3 },
    properties: {} as SectionProperties,
  },
  {
    code: 'NP_200',
    name: 'NP 200 I-Profil',
    shape: 'i-beam',
    dimensions: { height: 200, flangeWidth: 100, flangeThickness: 8.5, webThickness: 5.6 },
    properties: {} as SectionProperties,
  },
  {
    code: 'NP_220',
    name: 'NP 220 I-Profil',
    shape: 'i-beam',
    dimensions: { height: 220, flangeWidth: 110, flangeThickness: 9.2, webThickness: 5.9 },
    properties: {} as SectionProperties,
  },
  {
    code: 'NP_240',
    name: 'NP 240 I-Profil',
    shape: 'i-beam',
    dimensions: { height: 240, flangeWidth: 120, flangeThickness: 9.8, webThickness: 6.2 },
    properties: {} as SectionProperties,
  },
  {
    code: 'NP_260',
    name: 'NP 260 I-Profil',
    shape: 'i-beam',
    dimensions: { height: 260, flangeWidth: 130, flangeThickness: 10.5, webThickness: 6.5 },
    properties: {} as SectionProperties,
  },
  {
    code: 'NP_300',
    name: 'NP 300 I-Profil',
    shape: 'i-beam',
    dimensions: { height: 300, flangeWidth: 150, flangeThickness: 11.5, webThickness: 7.2 },
    properties: {} as SectionProperties,
  },
];

// Kutu Profilleri (BOŞ - Kare)
export const BOX_PROFILES: StandardProfile[] = [
  {
    code: 'BOX_60x3',
    name: 'Kutu 60x60x3',
    shape: 'box',
    dimensions: { height: 60, width: 60, thickness: 3 },
    properties: {} as SectionProperties,
  },
  {
    code: 'BOX_80x4',
    name: 'Kutu 80x80x4',
    shape: 'box',
    dimensions: { height: 80, width: 80, thickness: 4 },
    properties: {} as SectionProperties,
  },
  {
    code: 'BOX_100x5',
    name: 'Kutu 100x100x5',
    shape: 'box',
    dimensions: { height: 100, width: 100, thickness: 5 },
    properties: {} as SectionProperties,
  },
  {
    code: 'BOX_120x5',
    name: 'Kutu 120x120x5',
    shape: 'box',
    dimensions: { height: 120, width: 120, thickness: 5 },
    properties: {} as SectionProperties,
  },
  {
    code: 'BOX_150x6',
    name: 'Kutu 150x150x6',
    shape: 'box',
    dimensions: { height: 150, width: 150, thickness: 6 },
    properties: {} as SectionProperties,
  },
];

// Boru Profilleri
export const PIPE_PROFILES: StandardProfile[] = [
  {
    code: 'PIPE_48x3',
    name: 'Boru 48.3x3.2',
    shape: 'pipe',
    dimensions: { outerDiameter: 48.3, wallThickness: 3.2 },
    properties: {} as SectionProperties,
  },
  {
    code: 'PIPE_60x3',
    name: 'Boru 60.3x3.2',
    shape: 'pipe',
    dimensions: { outerDiameter: 60.3, wallThickness: 3.2 },
    properties: {} as SectionProperties,
  },
  {
    code: 'PIPE_76x4',
    name: 'Boru 76.1x4.0',
    shape: 'pipe',
    dimensions: { outerDiameter: 76.1, wallThickness: 4.0 },
    properties: {} as SectionProperties,
  },
  {
    code: 'PIPE_88x4',
    name: 'Boru 88.9x4.0',
    shape: 'pipe',
    dimensions: { outerDiameter: 88.9, wallThickness: 4.0 },
    properties: {} as SectionProperties,
  },
  {
    code: 'PIPE_114x4',
    name: 'Boru 114.3x4.0',
    shape: 'pipe',
    dimensions: { outerDiameter: 114.3, wallThickness: 4.0 },
    properties: {} as SectionProperties,
  },
];

// Initialize properties for standard profiles
function initializeStandardProfiles() {
  for (const profile of NP_PROFILES) {
    profile.properties = calculateSectionProperties({
      shape: 'i-beam',
      ...profile.dimensions,
    } as IBeamSection);
  }
  for (const profile of BOX_PROFILES) {
    profile.properties = calculateSectionProperties({
      shape: 'box',
      ...profile.dimensions,
    } as BoxSection);
  }
  for (const profile of PIPE_PROFILES) {
    profile.properties = calculateSectionProperties({
      shape: 'pipe',
      ...profile.dimensions,
    } as PipeSection);
  }
}

initializeStandardProfiles();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Gerilme hesabı: σ = M / W
export function calculateBendingStress(moment: number, sectionModulus: number): number {
  // moment: kNm, sectionModulus: mm³
  // σ = M * 10⁶ / W (N/mm² = MPa)
  return (moment * 1e6) / sectionModulus;
}

// Basınç kontrolü: σ = N / A
export function calculateCompressiveStress(axialForce: number, area: number): number {
  // axialForce: kN, area: mm²
  // σ = N * 10³ / A (N/mm² = MPa)
  return (axialForce * 1000) / area;
}

// Burkulma kontrolü (basit yaklaşım - Euler)
export function calculateEulerBucklingLoad(
  E: number,         // MPa
  I: number,         // mm⁴
  length: number,    // m
  K: number = 1      // Etkili uzunluk katsayısı (pinned-pinned: 1, fixed-fixed: 0.5, etc.)
): number {
  // Pcr = π² * E * I / (K * L)²
  const L_mm = length * 1000;
  return (Math.pow(Math.PI, 2) * E * I) / Math.pow(K * L_mm, 2) / 1000; // kN
}

// Narinlik oranı: λ = K * L / r
export function calculateSlendernessRatio(
  length: number,    // m
  radiusOfGyration: number, // mm
  K: number = 1
): number {
  const L_mm = length * 1000;
  return (K * L_mm) / radiusOfGyration;
}

// Narinlik kontrolü (TS 500)
export function checkSlenderness(
  slendernessRatio: number,
  materialType: 'steel' | 'concrete'
): { isSlender: boolean; limit: number; ratio: number } {
  const limit = materialType === 'steel' ? 250 : 150;
  return {
    isSlender: slendernessRatio > limit,
    limit,
    ratio: slendernessRatio,
  };
}

// ============================================================================
// PUBLIC API
// ============================================================================

export function getStandardProfile(code: string): StandardProfile | undefined {
  return [...NP_PROFILES, ...BOX_PROFILES, ...PIPE_PROFILES].find(p => p.code === code);
}

export function getAllStandardProfiles(): StandardProfile[] {
  return [...NP_PROFILES, ...BOX_PROFILES, ...PIPE_PROFILES];
}

export function getProfilesByShape(shape: SectionShape): StandardProfile[] {
  return getAllStandardProfiles().filter(p => p.shape === shape);
}
