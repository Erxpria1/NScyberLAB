import React from 'react';
import { StyleSheet } from 'react-native';
import { Colors, Typography } from '@/utils/theme';
import { MathRenderer } from './MathRenderer';

export interface KatexRenderProps {
  formula: string;
  displayMode?: boolean;
  color?: string;
  fontSize?: number;
  fallback?: string;
}

export const KatexRender: React.FC<KatexRenderProps> = ({
  formula,
  displayMode = false,
  color = Colors.amber.primary,
  fontSize = Typography.sizes.equation,
  fallback,
}) => {
  // Use high-fidelity MathRenderer as default
  return (
    <MathRenderer
      formula={formula}
      displayMode={displayMode}
      fontSize={fontSize}
      color={color}
      style={[styles.container, displayMode && styles.displayMode]}
    />
  );
};

/**
 * Simple LaTeX to Unicode converter
 * Handles common mathematical notation for engineering formulas
 */
function latexToUnicode(latex: string): string {
  let result = latex;

  // Greek letters
  const greek: Record<string, string> = {
    '\\alpha': 'α',
    '\\beta': 'β',
    '\\gamma': 'γ',
    '\\Gamma': 'Γ',
    '\\delta': 'δ',
    '\\Delta': 'Δ',
    '\\epsilon': 'ε',
    '\\theta': 'θ',
    '\\Theta': 'Θ',
    '\\lambda': 'λ',
    '\\Lambda': 'Λ',
    '\\mu': 'μ',
    '\\pi': 'π',
    '\\Pi': 'Π',
    '\\sigma': 'σ',
    '\\Sigma': 'Σ',
    '\\tau': 'τ',
    '\\phi': 'φ',
    '\\Phi': 'Φ',
    '\\omega': 'ω',
    '\\Omega': 'Ω',
    '\\psi': 'ψ',
    '\\Psi': 'Ψ',
  };

  // Superscripts and subscripts
  result = result.replace(/\^{([^}]+)}/g, (match: string, sup: string) => {
    return sup.split('').map((c: string) => toSuperscript(c)).join('');
  });
  result = result.replace(/_{([^}]+)}/g, (match: string, sub: string) => {
    return sub.split('').map((c: string) => toSubscript(c)).join('');
  });

  // Simple superscript/subscript without braces
  result = result.replace(/\^(\w)/g, (match, char) => toSuperscript(char));
  result = result.replace(/_(\w)/g, (match, char) => toSubscript(char));

  // Fractions
  result = result.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');

  // Square roots
  result = result.replace(/\\sqrt\{([^}]+)\}/g, '√($1)');

  // Greek letters
  for (const [latexChar, unicodeChar] of Object.entries(greek)) {
    result = result.replace(new RegExp(latexChar.replace(/\\/g, '\\\\'), 'g'), unicodeChar);
  }

  // Common symbols
  result = result.replace(/\\times/g, '×');
  result = result.replace(/\\div/g, '÷');
  result = result.replace(/\\pm/g, '±');
  result = result.replace(/\\mp/g, '∓');
  result = result.replace(/\\neq/g, '≠');
  result = result.replace(/\\leq/g, '≤');
  result = result.replace(/\\geq/g, '≥');
  result = result.replace(/\\approx/g, '≈');
  result = result.replace(/\\infty/g, '∞');
  result = result.replace(/\\partial/g, '∂');
  result = result.replace(/\\nabla/g, '∇');
  result = result.replace(/\\int/g, '∫');
  result = result.replace(/\\sum/g, 'Σ');

  // Remove LaTeX formatting
  result = result.replace(/\\text\{([^}]+)\}/g, '$1');
  result = result.replace(/\\mathrm\{([^}]+)\}/g, '$1');
  result = result.replace(/\\left/g, '');
  result = result.replace(/\\right/g, '');

  return result;
}

function toSuperscript(char: string): string {
  const sup: Record<string, string> = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
    'n': 'ⁿ',
  };
  return sup[char] || char;
}

function toSubscript(char: string): string {
  const sub: Record<string, string> = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
    '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
  };
  return sub[char] || char;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  displayMode: {
    justifyContent: 'center',
    paddingVertical: 8,
  },
  formula: {
    fontFamily: Typography.family.mono,
    fontWeight: '500',
  },
  latexSource: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.caption,
    color: Colors.gray[400],
    marginTop: 2,
    fontStyle: 'italic',
  },
});

/**
 * Predefined common engineering formulas
 */
export const EngineeringFormulas = {
  // Stress
  stress: '\\sigma = \\frac{M}{S}',
  // Bending stress
  bendingStress: '\\sigma = \\frac{Mc}{I}',
  // Deflection (simply supported, point load)
  deflectionPoint: '\\delta = \\frac{PL^3}{48EI}',
  // Deflection (simply supported, UDL)
  deflectionUDL: '\\delta = \\frac{5wL^4}{384EI}',
  // Moment (simply supported, point load)
  momentPoint: 'M = \\frac{Pa}{L}',
  // Shear force
  shear: 'V = \\frac{dM}{dx}',
  // Reaction forces
  equilibrium: '\\Sigma F_y = 0',
  momentEquilibrium: '\\Sigma M = 0',
} as const;
