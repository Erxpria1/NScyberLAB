import { normalizeDecimal, parseNumberSafe, formatNumber } from '../numberUtils';

describe('numberUtils', () => {
  describe('normalizeDecimal', () => {
    it('converts comma to dot', () => {
      expect(normalizeDecimal('3,5')).toBe('3.5');
      expect(normalizeDecimal('123,45')).toBe('123.45');
    });

    it('leaves dot as is', () => {
      expect(normalizeDecimal('3.5')).toBe('3.5');
      expect(normalizeDecimal('123.45')).toBe('123.45');
    });

    it('handles spaces and trimming', () => {
      // normalizeDecimal only replaces comma, doesn't trim
      // parseNumberSafe handles trimming
      expect(normalizeDecimal(' 3,5 ')).toBe(' 3.5 ');
      expect(normalizeDecimal('\t3.5\n')).toBe('\t3.5\n');
    });

    it('handles negative numbers', () => {
      expect(normalizeDecimal('-3,5')).toBe('-3.5');
      expect(normalizeDecimal('-3.5')).toBe('-3.5');
    });

    it('handles integers', () => {
      expect(normalizeDecimal('42')).toBe('42');
      expect(normalizeDecimal('42,0')).toBe('42.0');
    });

    it('handles edge cases', () => {
      expect(normalizeDecimal('')).toBe('');
      expect(normalizeDecimal(',')).toBe('.');
      expect(normalizeDecimal('.')).toBe('.');
    });
  });

  describe('parseNumberSafe', () => {
    it('parses comma decimal input', () => {
      expect(parseNumberSafe('3,5')).toBe(3.5);
      expect(parseNumberSafe('123,45')).toBe(123.45);
    });

    it('parses dot decimal input', () => {
      expect(parseNumberSafe('3.5')).toBe(3.5);
      expect(parseNumberSafe('123.45')).toBe(123.45);
    });

    it('parses integers', () => {
      expect(parseNumberSafe('42')).toBe(42);
      expect(parseNumberSafe('0')).toBe(0);
    });

    it('handles negative numbers', () => {
      expect(parseNumberSafe('-3,5')).toBe(-3.5);
      expect(parseNumberSafe('-3.5')).toBe(-3.5);
    });

    it('returns 0 for invalid input', () => {
      expect(parseNumberSafe('')).toBe(0);
      expect(parseNumberSafe('abc')).toBe(0);
      expect(parseNumberSafe('abc,def')).toBe(0);
    });

    it('handles whitespace', () => {
      expect(parseNumberSafe(' 3,5 ')).toBe(3.5);
      expect(parseNumberSafe('\t3.5\n')).toBe(3.5);
    });
  });

  describe('formatNumber', () => {
    it('formats with default 2 decimals', () => {
      expect(formatNumber(3.5)).toBe('3.50');
      expect(formatNumber(123.456)).toBe('123.46');
    });

    it('formats with custom decimals', () => {
      expect(formatNumber(3.5, 0)).toBe('4');
      expect(formatNumber(3.5, 1)).toBe('3.5');
      expect(formatNumber(3.5, 4)).toBe('3.5000');
    });

    it('handles integers', () => {
      expect(formatNumber(42)).toBe('42.00');
      expect(formatNumber(0)).toBe('0.00');
    });

    it('handles negative numbers', () => {
      expect(formatNumber(-3.5)).toBe('-3.50');
    });
  });
});
