// ============================================================================
// LOAD FACTORY TESTS
// Tests for load creation and formatting
// ============================================================================

import {
  createLoad,
  createPreviewLoad,
  formatLoadDescription,
  getLoadTypeLabel,
  getLoadTypeShortLabel,
  LOAD_TYPE_LABELS,
  LOAD_TYPE_SHORT_LABELS,
  formatQuickPosition,
  quickPositionToValue,
  QUICK_MAGNITUDES,
} from '../loadFactory';
import { LoadType } from '../reactionCalculator';

describe('loadFactory', () => {
  describe('createLoad', () => {
    it('should create POINT load with downward (negative) magnitude', () => {
      const load = createLoad(LoadType.POINT, {
        position: 3,
        magnitude: 10,
      }) as any;
      expect(load.type).toBe(LoadType.POINT);
      expect(load.position).toBe(3);
      expect(load.magnitude).toBe(-10); // Downward = negative
    });

    it('should create UDL load with downward magnitude', () => {
      const load = createLoad(LoadType.UDL, {
        startPosition: 0,
        endPosition: 4,
        magnitude: 5,
      }) as any;
      expect(load.type).toBe(LoadType.UDL);
      expect(load.startPosition).toBe(0);
      expect(load.endPosition).toBe(4);
      expect(load.magnitude).toBe(-5);
    });

    it('should create MOMENT load preserving sign', () => {
      const load = createLoad(LoadType.MOMENT, {
        position: 2,
        magnitude: 15,
      }) as any;
      expect(load.type).toBe(LoadType.MOMENT);
      expect(load.position).toBe(2);
      expect(load.magnitude).toBe(15); // Moment preserves sign
    });

    it('should create TRIANGULAR load with downward magnitude', () => {
      const load = createLoad(LoadType.TRIANGULAR, {
        startPosition: 1,
        endPosition: 5,
        magnitude: 8,
      }) as any;
      expect(load.type).toBe(LoadType.TRIANGULAR);
      expect(load.startPosition).toBe(1);
      expect(load.endPosition).toBe(5);
      expect(load.maxMagnitude).toBe(-8);
    });
  });

  describe('createPreviewLoad', () => {
    it('should create valid POINT load preview', () => {
      const load = createPreviewLoad(LoadType.POINT, '3', '10', '', '', 6);
      expect(load).not.toBeNull();
      expect(load?.type).toBe(LoadType.POINT);
      expect((load as any)?.magnitude).toBe(-10);
    });

    it('should return null for invalid position', () => {
      const load = createPreviewLoad(LoadType.POINT, '10', '5', '', '', 6);
      expect(load).toBeNull();
    });

    it('should return null for invalid magnitude', () => {
      const load = createPreviewLoad(LoadType.POINT, '3', '0', '', '', 6);
      expect(load).toBeNull();
    });

    it('should create valid UDL load preview', () => {
      const load = createPreviewLoad(LoadType.UDL, '', '5', '0', '4', 6);
      expect(load).not.toBeNull();
      expect(load?.type).toBe(LoadType.UDL);
      expect((load as any)?.magnitude).toBe(-5);
    });

    it('should create valid MOMENT load preview', () => {
      const load = createPreviewLoad(LoadType.MOMENT, '2.5', '10', '', '', 6);
      expect(load).not.toBeNull();
      expect(load?.type).toBe(LoadType.MOMENT);
      expect((load as any)?.magnitude).toBe(10);
    });

    it('should handle Turkish comma format', () => {
      const load = createPreviewLoad(LoadType.POINT, '3,5', '10,5', '', '', 6);
      expect(load).not.toBeNull();
      expect((load as any)?.position).toBe(3.5);
      expect((load as any)?.magnitude).toBe(-10.5);
    });
  });

  describe('formatLoadDescription', () => {
    it('should format POINT load', () => {
      const load = {
        type: LoadType.POINT,
        position: 3,
        magnitude: -10,
      } as any;
      const desc = formatLoadDescription(load);
      expect(desc).toContain('10.0');
      expect(desc).toContain('3.00');
      expect(desc).toContain('kN');
    });

    it('should format UDL load', () => {
      const load = {
        type: LoadType.UDL,
        startPosition: 0,
        endPosition: 4,
        magnitude: -5,
      } as any;
      const desc = formatLoadDescription(load);
      expect(desc).toContain('5.0');
      expect(desc).toContain('0.0');
      expect(desc).toContain('4.0');
      expect(desc).toContain('kN/m');
    });

    it('should format MOMENT load', () => {
      const load = {
        type: LoadType.MOMENT,
        position: 2,
        magnitude: 15,
      } as any;
      const desc = formatLoadDescription(load);
      expect(desc).toContain('15.0');
      expect(desc).toContain('2.00');
      expect(desc).toContain('kNm');
    });

    it('should format TRIANGULAR load', () => {
      const load = {
        type: LoadType.TRIANGULAR,
        startPosition: 1,
        endPosition: 5,
        maxMagnitude: -8,
      } as any;
      const desc = formatLoadDescription(load);
      expect(desc).toContain('8.0');
      expect(desc).toContain('1.0');
      expect(desc).toContain('5.0');
      expect(desc).toContain('kN/m');
    });
  });

  describe('getLoadTypeLabel', () => {
    it('should return Turkish labels', () => {
      expect(getLoadTypeLabel(LoadType.POINT)).toBe('Nokta Yükü');
      expect(getLoadTypeLabel(LoadType.UDL)).toBe('Yayılan Yük');
      expect(getLoadTypeLabel(LoadType.MOMENT)).toBe('Moment');
      expect(getLoadTypeLabel(LoadType.TRIANGULAR)).toBe('Üçgen Yük');
    });
  });

  describe('getLoadTypeShortLabel', () => {
    it('should return short labels', () => {
      expect(getLoadTypeShortLabel(LoadType.POINT)).toBe('P');
      expect(getLoadTypeShortLabel(LoadType.UDL)).toBe('w');
      expect(getLoadTypeShortLabel(LoadType.MOMENT)).toBe('M');
      expect(getLoadTypeShortLabel(LoadType.TRIANGULAR)).toBe('△');
    });
  });

  describe('formatQuickPosition', () => {
    it('should format position ratios', () => {
      expect(formatQuickPosition(0)).toBe('0');
      expect(formatQuickPosition(1)).toBe('L');
      expect(formatQuickPosition(0.25)).toBe('0.25L');
      expect(formatQuickPosition(0.5)).toBe('0.5L');
      expect(formatQuickPosition(0.75)).toBe('0.75L');
    });
  });

  describe('quickPositionToValue', () => {
    it('should convert ratio to actual position', () => {
      expect(quickPositionToValue(0, 6)).toBe(0);
      expect(quickPositionToValue(0.5, 6)).toBe(3);
      expect(quickPositionToValue(1, 6)).toBe(6);
      expect(quickPositionToValue(0.25, 8)).toBe(2);
    });
  });

  describe('QUICK_MAGNITUDES', () => {
    it('should have expected values', () => {
      expect(QUICK_MAGNITUDES).toEqual([5, 10, 15, 20, 25, 50]);
    });
  });

  describe('LOAD_TYPE_LABELS', () => {
    it('should have all Turkish labels', () => {
      expect(LOAD_TYPE_LABELS[LoadType.POINT]).toBe('Nokta Yükü');
      expect(LOAD_TYPE_LABELS[LoadType.UDL]).toBe('Yayılan Yük');
      expect(LOAD_TYPE_LABELS[LoadType.MOMENT]).toBe('Moment');
      expect(LOAD_TYPE_LABELS[LoadType.TRIANGULAR]).toBe('Üçgen Yük');
    });
  });

  describe('LOAD_TYPE_SHORT_LABELS', () => {
    it('should have all short labels', () => {
      expect(LOAD_TYPE_SHORT_LABELS[LoadType.POINT]).toBe('P');
      expect(LOAD_TYPE_SHORT_LABELS[LoadType.UDL]).toBe('w');
      expect(LOAD_TYPE_SHORT_LABELS[LoadType.MOMENT]).toBe('M');
      expect(LOAD_TYPE_SHORT_LABELS[LoadType.TRIANGULAR]).toBe('△');
    });
  });
});
