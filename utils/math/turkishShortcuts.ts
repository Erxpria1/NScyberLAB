// ============================================================================
// TURKISH MATH SHORTCUTS & SYMBOLS
// ============================================================================

/**
 * Turkish to Greek symbol mapping
 * Allows typing Turkish names for mathematical symbols
 */
export const TURKISH_TO_GREEK: Record<string, string> = {
  // Stress
  'sigma': '\\sigma',
  'sig': '\\sigma',
  'tau': '\\tau',
  'epsilon': '\\epsilon',
  'eps': '\\epsilon',

  // Common
  'delta': '\\delta',
  'theta': '\\theta',
  'lambda': '\\lambda',
  'mu': '\\mu',
  'pi': '\\pi',
  'phi': '\\phi',
  'psi': '\\psi',
  'omega': '\\omega',
  'alfa': '\\alpha',
  'beta': '\\beta',
  'gama': '\\gamma',
  'kappa': '\\kappa',
  'ro': '\\rho',

  // Operators
  'toplam': '\\sum',
  'urun': '\\prod',
  'integral': '\\int',
  'esik': '\\lim',
  'kok': '\\sqrt',
  'kok3': '\\sqrt[3]',
  'sonsuz': '\\infty',

  // Relations
  'yaklasik': '\\approx',
  'kucuk_esit': '\\leq',
  'buyuk_esit': '\\geq',
  'esit_degil': '\\neq',
  'esit_yaklasik': '\\cong',

  // Sets
  'kume': '\\mathbb',
  'altkume': '\\subset',
  'birlesim': '\\cup',
  'kesisim': '\\cap',
  'bost': '\\emptyset',

  // Calculus
  'turev': '\\frac{d}{dx}',
  'kısmi_turev': '\\frac{\\partial}{\\partial x}',
  'integral_tanimli': '\\int_{a}^{b}',
};

/**
 * Display symbols for Turkish names
 */
export const TURKISH_SYMBOLS: Record<string, string> = {
  'stress': '\\sigma',
  'kayma': '\\tau',
  'eyilme': '\\varepsilon',
  'gerilme': '\\sigma',
  'yogunluk': '\\rho',
  'aci': '\\theta',
  'uzama': '\\delta',
  'acisal_hiz': '\\omega',
};

/**
 * Common engineering formulas - Turkish templates
 */
export const ENGINEERING_FORMULAS_TR: Record<string, string> = {
  // Stress & Strain
  'normal_stress': '\\sigma = \\frac{F}{A}',
  'shear_stress': '\\tau = \\frac{V}{A}',
  'strain': '\\varepsilon = \\frac{\\Delta L}{L_0}',
  'stress_strain': '\\sigma = E \\cdot \\varepsilon',

  // Bending
  'bending_stress': '\\sigma = \\frac{M \\cdot y}{I}',
  'moment': 'M = F \\cdot d',
  'section_modulus': '\\sigma = \\frac{M}{S}',
  'deflection': '\\delta = \\frac{FL^3}{3EI}',

  // Columns
  'euler_buckling': 'P_{cr} = \\frac{\\pi^2 EI}{(KL)^2}',
  'slenderness': '\\lambda = \\frac{KL}{r}',

  // Beams
  'shear_force': 'V = \\frac{dM}{dx}',
  'load_relation': 'w = \\frac{dV}{dx}',
  'max_moment': 'M_{max} = \\frac{wL^2}{8}',

  // Truss
  'method_joints': '\\sum F_x = 0, \\sum F_y = 0',
  'method_sections': '\\sum M = 0, \\sum F_x = 0, \\sum F_y = 0',
};

/**
 * Replace Turkish shortcuts with LaTeX commands
 */
export function replaceTurkishShortcuts(latex: string): string {
  let result = latex;

  // Replace Turkish to Greek
  for (const [turkish, greek] of Object.entries(TURKISH_TO_GREEK)) {
    const regex = new RegExp(`\\b${turkish}\\b`, 'gi');
    result = result.replace(regex, greek);
  }

  return result;
}

/**
 * Handle Turkish characters in LaTeX
 * Ensures ş, ğ, ü, ö, ı, ç are properly handled
 */
export function handleTurkishChars(latex: string): string {
  // Wrap Turkish chars in \text{} for proper rendering
  return latex
    .replace(/ş/g, '\\text{ş}')
    .replace(/Ş/g, '\\text{Ş}')
    .replace(/ğ/g, '\\text{ğ}')
    .replace(/Ğ/g, '\\text{Ğ}')
    .replace(/ü/g, '\\text{ü}')
    .replace(/Ü/g, '\\text{Ü}')
    .replace(/ö/g, '\\text{ö}')
    .replace(/Ö/g, '\\text{Ö}')
    .replace(/ı/g, '\\text{ı}')
    .replace(/İ/g, '\\text{İ}')
    .replace(/ç/g, '\\text{ç}')
    .replace(/Ç/g, '\\text{Ç}');
}

/**
 * Get formula by Turkish name
 */
export function getFormula(name: string): string | undefined {
  return ENGINEERING_FORMULAS_TR[name];
}

/**
 * Complete LaTeX preprocessing for Turkish
 */
export function preprocessTurkishLatex(latex: string): string {
  let result = latex;

  // Apply shortcuts
  result = replaceTurkishShortcuts(result);

  // Handle Turkish chars (only in text, not commands)
  // This is handled by KaTeX's auto-render mode with proper escaping

  return result;
}
