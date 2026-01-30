// ============================================================================
// POSITION UTILITIES TESTS
// Tests for position to pixel conversion and utilities
// ============================================================================

import {
  calculateScale,
  positionToPixel,
  positionsToPixels,
  clampPosition,
  isPositionValid,
  positionToRatio,
  ratioToPosition,
  formatPositionRatio,
  quickRatioToPosition,
  distanceBetween,
  nearestQuickRatio,
  calculateBeamDimensions,
  QUICK_POSITION_RATIOS,
} from '../positionUtils';

describe('positionUtils', () => {
  const MOCK_SCREEN_WIDTH = 375;
  const MOCK_BEAM_PADDING = 40;

  describe('calculateScale', () => {
    it('should calculate correct scale for 6m beam', () => {
      const scale = calculateScale(6, MOCK_SCREEN_WIDTH, MOCK_BEAM_PADDING);
      expect(scale).toBe((MOCK_SCREEN_WIDTH - 2 * MOCK_BEAM_PADDING) / 6);
    });

    it('should handle zero beam length', () => {
      const scale = calculateScale(0, MOCK_SCREEN_WIDTH, MOCK_BEAM_PADDING);
      expect(scale).toBe(MOCK_SCREEN_WIDTH - 2 * MOCK_BEAM_PADDING);
    });

    it('should scale correctly for different screen widths', () => {
      const scale1 = calculateScale(6, 375, 40);
      const scale2 = calculateScale(6, 414, 40);
      expect(scale2).toBeGreaterThan(scale1);
    });
  });

  describe('positionToPixel', () => {
    it('should convert position to pixel with offset', () => {
      const scale = 50;
      const offset = 40;
      expect(positionToPixel(0, scale, offset)).toBe(40);
      expect(positionToPixel(1, scale, offset)).toBe(90);
      expect(positionToPixel(3, scale, offset)).toBe(190);
    });

    it('should use default offset when not provided', () => {
      const scale = 50;
      const result = positionToPixel(2, scale);
      expect(result).toBe(40 + 2 * 50);
    });
  });

  describe('positionsToPixels', () => {
    it('should convert multiple positions', () => {
      const scale = 50;
      const offset = 40;
      const positions = [0, 1, 2, 3];
      const pixels = positionsToPixels(positions, scale, offset);
      expect(pixels).toEqual([40, 90, 140, 190]);
    });

    it('should return empty array for empty input', () => {
      const pixels = positionsToPixels([], 50, 40);
      expect(pixels).toEqual([]);
    });
  });

  describe('clampPosition', () => {
    it('should clamp position within bounds', () => {
      expect(clampPosition(-1, 6)).toBe(0);
      expect(clampPosition(0, 6)).toBe(0);
      expect(clampPosition(3, 6)).toBe(3);
      expect(clampPosition(6, 6)).toBe(6);
      expect(clampPosition(10, 6)).toBe(6);
    });
  });

  describe('isPositionValid', () => {
    it('should check validity', () => {
      expect(isPositionValid(-1, 6)).toBe(false);
      expect(isPositionValid(0, 6)).toBe(true);
      expect(isPositionValid(3, 6)).toBe(true);
      expect(isPositionValid(6, 6)).toBe(true);
      expect(isPositionValid(7, 6)).toBe(false);
    });
  });

  describe('positionToRatio', () => {
    it('should convert position to ratio', () => {
      expect(positionToRatio(0, 6)).toBe(0);
      expect(positionToRatio(3, 6)).toBe(0.5);
      expect(positionToRatio(6, 6)).toBe(1);
    });

    it('should clamp out of bounds positions', () => {
      expect(positionToRatio(-1, 6)).toBe(0);
      expect(positionToRatio(10, 6)).toBe(1);
    });
  });

  describe('ratioToPosition', () => {
    it('should convert ratio to position', () => {
      expect(ratioToPosition(0, 6)).toBe(0);
      expect(ratioToPosition(0.5, 6)).toBe(3);
      expect(ratioToPosition(1, 6)).toBe(6);
    });

    it('should clamp ratio', () => {
      expect(ratioToPosition(-0.5, 6)).toBe(0);
      expect(ratioToPosition(1.5, 6)).toBe(6);
    });
  });

  describe('formatPositionRatio', () => {
    it('should format standard ratios', () => {
      expect(formatPositionRatio(0)).toBe('0');
      expect(formatPositionRatio(1)).toBe('L');
      expect(formatPositionRatio(0.25)).toBe('L/4');
      expect(formatPositionRatio(0.5)).toBe('L/2');
      expect(formatPositionRatio(0.75)).toBe('3L/4');
    });

    it('should format custom ratios with L notation', () => {
      expect(formatPositionRatio(0.33)).toBe('0.33L');
      expect(formatPositionRatio(0.1, 10)).toBe('0.1L');
    });
  });

  describe('quickRatioToPosition', () => {
    it('should convert quick ratios to positions', () => {
      expect(quickRatioToPosition(0, 6)).toBe(0);
      expect(quickRatioToPosition(0.25, 6)).toBe(1.5);
      expect(quickRatioToPosition(0.5, 6)).toBe(3);
      expect(quickRatioToPosition(0.75, 6)).toBe(4.5);
      expect(quickRatioToPosition(1, 6)).toBe(6);
    });
  });

  describe('distanceBetween', () => {
    it('should calculate distance', () => {
      expect(distanceBetween(0, 6)).toBe(6);
      expect(distanceBetween(2, 5)).toBe(3);
      expect(distanceBetween(5, 2)).toBe(3);
    });
  });

  describe('nearestQuickRatio', () => {
    it('should find nearest quick ratio', () => {
      expect(nearestQuickRatio(0, 6)).toBe(0);
      expect(nearestQuickRatio(0.1, 6)).toBe(0);
      expect(nearestQuickRatio(0.3, 6)).toBe(0.25);
      expect(nearestQuickRatio(0.5, 6)).toBe(0.5);
      expect(nearestQuickRatio(0.9, 6)).toBe(1);
    });
  });

  describe('calculateBeamDimensions', () => {
    it('should calculate all dimensions', () => {
      const dims = calculateBeamDimensions(6, MOCK_SCREEN_WIDTH, MOCK_BEAM_PADDING);
      expect(dims.scale).toBe((MOCK_SCREEN_WIDTH - 2 * MOCK_BEAM_PADDING) / 6);
      expect(dims.startX).toBe(MOCK_BEAM_PADDING);
      expect(dims.endX).toBe(MOCK_BEAM_PADDING + 6 * dims.scale);
      expect(dims.beamWidth).toBe(6 * dims.scale);
    });
  });

  describe('QUICK_POSITION_RATIOS', () => {
    it('should have expected values', () => {
      expect(QUICK_POSITION_RATIOS).toEqual([0, 0.25, 0.5, 0.75, 1]);
    });
  });
});
