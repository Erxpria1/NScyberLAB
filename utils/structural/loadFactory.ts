// ============================================================================
// LOAD FACTORY
// Creates Load objects from validated inputs
// ============================================================================

import { LoadType, type Load, type PointLoad, type UDLoad, type MomentLoad, type TriangularLoad } from './reactionCalculator';
import type { LoadInputs } from './loadValidation';

// ============================================================================
// LOAD LABELS (Turkish)
// ============================================================================

export const LOAD_TYPE_LABELS: Record<LoadType, string> = {
  [LoadType.POINT]: 'Nokta Yükü',
  [LoadType.UDL]: 'Yayılı Yük',
  [LoadType.MOMENT]: 'Moment',
  [LoadType.TRIANGULAR]: 'Üçgen Yük',
};

export const LOAD_TYPE_SHORT_LABELS: Record<LoadType, string> = {
  [LoadType.POINT]: 'P',
  [LoadType.UDL]: 'w',
  [LoadType.MOMENT]: 'M',
  [LoadType.TRIANGULAR]: '△',
};

// ============================================================================
// LOAD CREATION
// ============================================================================

/**
 * Creates a Load object from type and validated inputs
 */
export function createLoad(type: LoadType, inputs: LoadInputs): Load {
  const magnitude = inputs.magnitude ?? 0;

  switch (type) {
    case LoadType.POINT:
      return {
        type: LoadType.POINT,
        position: inputs.position ?? 0,
        magnitude: -Math.abs(magnitude), // Downward = negative
      } as PointLoad;

    case LoadType.UDL:
      return {
        type: LoadType.UDL,
        startPosition: inputs.startPosition ?? 0,
        endPosition: inputs.endPosition ?? 0,
        magnitude: -Math.abs(magnitude), // Downward = negative
      } as UDLoad;

    case LoadType.MOMENT:
      return {
        type: LoadType.MOMENT,
        position: inputs.position ?? 0,
        magnitude: magnitude, // Moment can be positive or negative
      } as MomentLoad;

    case LoadType.TRIANGULAR:
      return {
        type: LoadType.TRIANGULAR,
        startPosition: inputs.startPosition ?? 0,
        endPosition: inputs.endPosition ?? 0,
        maxMagnitude: -Math.abs(magnitude), // Downward = negative
      } as TriangularLoad;

    default:
      throw new Error(`Unknown load type: ${type}`);
  }
}

/**
 * Creates a preview Load object (without adding to state)
 * Returns null if inputs are invalid
 */
export function createPreviewLoad(
  type: LoadType,
  pos: string,
  mag: string,
  start: string,
  end: string,
  beamLength: number
): Load | null {
  const position = parseFloat(pos.replace(',', '.'));
  const magnitude = parseFloat(mag.replace(',', '.'));
  const startPosition = parseFloat(start.replace(',', '.'));
  const endPosition = parseFloat(end.replace(',', '.'));

  if (isNaN(magnitude) || magnitude <= 0) return null;

  switch (type) {
    case LoadType.POINT:
      if (isNaN(position) || position < 0 || position > beamLength) return null;
      return {
        type: LoadType.POINT,
        position,
        magnitude: -Math.abs(magnitude),
      } as PointLoad;

    case LoadType.UDL:
      if (isNaN(startPosition) || isNaN(endPosition)) return null;
      if (startPosition < 0 || endPosition > beamLength || startPosition >= endPosition) return null;
      return {
        type: LoadType.UDL,
        startPosition,
        endPosition,
        magnitude: -Math.abs(magnitude),
      } as UDLoad;

    case LoadType.MOMENT:
      if (isNaN(position) || position < 0 || position > beamLength) return null;
      return {
        type: LoadType.MOMENT,
        position,
        magnitude,
      } as MomentLoad;

    case LoadType.TRIANGULAR:
      if (isNaN(startPosition) || isNaN(endPosition)) return null;
      if (startPosition < 0 || endPosition > beamLength || startPosition >= endPosition) return null;
      return {
        type: LoadType.TRIANGULAR,
        startPosition,
        endPosition,
        maxMagnitude: -Math.abs(magnitude),
      } as TriangularLoad;

    default:
      return null;
  }
}

// ============================================================================
// LOAD DESCRIPTION FORMATTING
// ============================================================================

/**
 * Formats a Load object for display in Turkish
 */
export function formatLoadDescription(load: Load): string {
  switch (load.type) {
    case LoadType.POINT:
      return `P = ${Math.abs(load.magnitude).toFixed(1)} kN @ x = ${load.position.toFixed(2)}m`;

    case LoadType.UDL:
      return `w = ${Math.abs(load.magnitude).toFixed(1)} kN/m [${load.startPosition.toFixed(1)}m - ${load.endPosition.toFixed(1)}m]`;

    case LoadType.MOMENT:
      return `M = ${load.magnitude.toFixed(1)} kNm @ x = ${load.position.toFixed(2)}m`;

    case LoadType.TRIANGULAR:
      return `Tri: w_max = ${Math.abs(load.maxMagnitude).toFixed(1)} kN/m [${load.startPosition.toFixed(1)}m - ${load.endPosition.toFixed(1)}m]`;

    default:
      return 'Bilinmeyen yük';
  }
}

/**
 * Gets the load type label in Turkish
 */
export function getLoadTypeLabel(type: LoadType): string {
  return LOAD_TYPE_LABELS[type];
}

/**
 * Gets the short label for UI (P, w, M, △)
 */
export function getLoadTypeShortLabel(type: LoadType): string {
  return LOAD_TYPE_SHORT_LABELS[type];
}

// ============================================================================
// LOAD ICON CONFIGURATION
// ============================================================================

export const LOAD_TYPE_CONFIG = [
  { type: LoadType.POINT, label: 'Nokta', short: 'P', icon: 'P' },
  { type: LoadType.UDL, label: 'Yayılı', short: 'w', icon: 'w' },
  { type: LoadType.MOMENT, label: 'Moment', short: 'M', icon: 'M' },
  { type: LoadType.TRIANGULAR, label: 'Üçgen', short: '△', icon: '△' },
] as const;

// ============================================================================
// PRESET QUICK VALUES
// ============================================================================

export const QUICK_MAGNITUDES = [5, 10, 15, 20, 25, 50] as const;
export const QUICK_POSITIONS = [0, 0.25, 0.5, 0.75, 1] as const;

/**
 * Formats a position ratio as a label (0, L/4, L/2, 3L/4, L)
 */
export function formatQuickPosition(ratio: number): string {
  if (ratio === 0) return '0';
  if (ratio === 1) return 'L';
  return `${ratio}L`;
}

/**
 * Converts a position ratio to actual position value
 */
export function quickPositionToValue(ratio: number, beamLength: number): number {
  return ratio * beamLength;
}
