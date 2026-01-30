// ============================================================================
// LOAD VALIDATION TESTS
// Tests for Turkish number format support and validation
// ============================================================================

import {
  validateLoadPosition,
  validateLoadMagnitude,
  validateLoadRange,
  validateLoadInputs,
  ErrorMessages,
} from '../loadValidation';
import { LoadType } from '../reactionCalculator';

describe('loadValidation', () => {
  describe('validateLoadPosition', () => {
    it('should accept valid position with dot decimal', () => {
      const result = validateLoadPosition('3.5', 6);
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(3.5);
    });

    it('should accept valid position with comma decimal (Turkish format)', () => {
      const result = validateLoadPosition('3,5', 6);
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(3.5);
    });

    it('should accept zero position', () => {
      const result = validateLoadPosition('0', 6);
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(0);
    });

    it('should accept position at beam length', () => {
      const result = validateLoadPosition('6', 6);
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(6);
    });

    it('should reject negative position', () => {
      const result = validateLoadPosition('-1', 6);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('negatif');
    });

    it('should reject position exceeding beam length', () => {
      const result = validateLoadPosition('7', 6);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('6');
    });

    it('should reject invalid number format', () => {
      const result = validateLoadPosition('abc', 6);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('geçerli');
    });
  });

  describe('validateLoadMagnitude', () => {
    it('should accept valid magnitude', () => {
      const result = validateLoadMagnitude('10.5');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(10.5);
    });

    it('should accept Turkish comma format', () => {
      const result = validateLoadMagnitude('10,5');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(10.5);
    });

    it('should reject zero magnitude', () => {
      const result = validateLoadMagnitude('0');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('sıfırdan büyük');
    });

    it('should reject negative magnitude', () => {
      const result = validateLoadMagnitude('-5');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('sıfırdan büyük');
    });

    it('should reject invalid format', () => {
      const result = validateLoadMagnitude('abc');
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateLoadRange', () => {
    it('should accept valid range', () => {
      const result = validateLoadRange('0', '3', 6);
      expect(result.isValid).toBe(true);
      expect(result.startValue).toBe(0);
      expect(result.endValue).toBe(3);
    });

    it('should accept Turkish comma format', () => {
      const result = validateLoadRange('1,5', '4,5', 6);
      expect(result.isValid).toBe(true);
      expect(result.startValue).toBe(1.5);
      expect(result.endValue).toBe(4.5);
    });

    it('should reject start >= end', () => {
      const result = validateLoadRange('4', '3', 6);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('küçük olmalıdır');
    });

    it('should reject start < 0', () => {
      const result = validateLoadRange('-1', '3', 6);
      expect(result.isValid).toBe(false);
    });

    it('should reject end > beam length', () => {
      const result = validateLoadRange('0', '7', 6);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('0 ile 6');
    });
  });

  describe('validateLoadInputs', () => {
    it('should validate POINT load inputs', () => {
      const result = validateLoadInputs(LoadType.POINT, '3', '10', '', '', 6);
      expect(result.isValid).toBe(true);
    });

    it('should validate MOMENT load inputs', () => {
      const result = validateLoadInputs(LoadType.MOMENT, '3', '10', '', '', 6);
      expect(result.isValid).toBe(true);
    });

    it('should validate UDL load inputs', () => {
      const result = validateLoadInputs(LoadType.UDL, '', '5', '0', '3', 6);
      expect(result.isValid).toBe(true);
    });

    it('should validate TRIANGULAR load inputs', () => {
      const result = validateLoadInputs(LoadType.TRIANGULAR, '', '10', '0', '4', 6);
      expect(result.isValid).toBe(true);
    });

    it('should reject POINT with invalid position', () => {
      const result = validateLoadInputs(LoadType.POINT, '10', '5', '', '', 6);
      expect(result.isValid).toBe(false);
    });

    it('should reject UDL with invalid range', () => {
      const result = validateLoadInputs(LoadType.UDL, '', '5', '4', '2', 6);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('küçük olmalıdır');
    });
  });

  describe('ErrorMessages', () => {
    it('should have position error with beam length', () => {
      const msg = ErrorMessages.POSITION_INVALID(8);
      expect(msg).toContain('8');
    });

    it('should have range error with beam length', () => {
      const msg = ErrorMessages.RANGE_INVALID(10);
      expect(msg).toContain('10');
    });
  });
});
