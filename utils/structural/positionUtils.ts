// ============================================================================
// POSITION UTILITIES
// Converting beam positions to screen coordinates
// ============================================================================

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_BEAM_PADDING = 40;
const DEFAULT_SCREEN_WIDTH = 375; // Common mobile width

// ============================================================================
// POSITION TO PIXEL CONVERSION
// ============================================================================

/**
 * Calculates pixels per meter scale factor
 */
export function calculateScale(
  beamLength: number,
  screenWidth: number = DEFAULT_SCREEN_WIDTH,
  padding: number = DEFAULT_BEAM_PADDING
): number {
  return (screenWidth - 2 * padding) / Math.max(beamLength, 1);
}

/**
 * Converts beam position (meters) to screen pixel coordinate
 */
export function positionToPixel(
  pos: number,
  scale: number,
  offset: number = DEFAULT_BEAM_PADDING
): number {
  return offset + pos * scale;
}

/**
 * Batch convert multiple positions to pixels
 */
export function positionsToPixels(
  positions: number[],
  scale: number,
  offset: number = DEFAULT_BEAM_PADDING
): number[] {
  return positions.map(pos => positionToPixel(pos, scale, offset));
}

// ============================================================================
// POSITION CLAMPING & VALIDATION
// ============================================================================

/**
 * Clamps position to valid range [0, max]
 */
export function clampPosition(pos: number, max: number): number {
  return Math.max(0, Math.min(pos, max));
}

/**
 * Checks if position is within valid range
 */
export function isPositionValid(pos: number, max: number): boolean {
  return pos >= 0 && pos <= max;
}

/**
 * Normalizes position to ratio [0, 1] of beam length
 */
export function positionToRatio(pos: number, beamLength: number): number {
  return clampPosition(pos, beamLength) / Math.max(beamLength, 1);
}

/**
 * Converts ratio [0, 1] to actual position
 */
export function ratioToPosition(ratio: number, beamLength: number): number {
  return clampPosition(ratio * beamLength, beamLength);
}

// ============================================================================
// QUICK POSITION LABELS
// ============================================================================

/**
 * Standard quick position ratios
 */
export const QUICK_POSITION_RATIOS = [0, 0.25, 0.5, 0.75, 1] as const;

/**
 * Formats a position ratio as a display label
 */
export function formatPositionRatio(ratio: number, beamLength?: number): string {
  if (ratio === 0) return '0';
  if (ratio === 1) return beamLength ? `${beamLength.toFixed(1)}m` : 'L';
  if (ratio === 0.25) return 'L/4';
  if (ratio === 0.5) return 'L/2';
  if (ratio === 0.75) return '3L/4';

  // For custom ratios, show as fraction of L
  return `${ratio}L`;
}

/**
 * Gets position value from quick ratio
 */
export function quickRatioToPosition(ratio: number, beamLength: number): number {
  return ratio * beamLength;
}

// ============================================================================
// DISTANCE CALCULATIONS
// ============================================================================

/**
 * Calculates distance between two positions
 */
export function distanceBetween(pos1: number, pos2: number): number {
  return Math.abs(pos2 - pos1);
}

/**
 * Finds nearest quick position ratio
 */
export function nearestQuickRatio(pos: number, beamLength: number): number {
  const ratio = positionToRatio(pos, beamLength);
  let nearest: number = QUICK_POSITION_RATIOS[0];
  let minDiff = Math.abs(ratio - nearest);

  for (const r of QUICK_POSITION_RATIOS) {
    const diff = Math.abs(ratio - r);
    if (diff < minDiff) {
      minDiff = diff;
      nearest = r;
    }
  }

  return nearest;
}

// ============================================================================
// BEAM DIMENSIONS FOR RENDERING
// ============================================================================

export interface BeamDimensions {
  scale: number;
  startX: number;
  endX: number;
  beamWidth: number;
}

/**
 * Calculates rendering dimensions for beam visualization
 */
export function calculateBeamDimensions(
  beamLength: number,
  screenWidth: number = DEFAULT_SCREEN_WIDTH,
  padding: number = DEFAULT_BEAM_PADDING
): BeamDimensions {
  const scale = calculateScale(beamLength, screenWidth, padding);
  const startX = padding;
  const endX = padding + beamLength * scale;
  const beamWidth = endX - startX;

  return { scale, startX, endX, beamWidth };
}
