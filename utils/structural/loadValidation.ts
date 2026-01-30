// ============================================================================
// LOAD INPUT VALIDATION
// Turkish number format support (comma/dot decimal separator)
// ============================================================================

import { LoadType, type Load } from './reactionCalculator';
import { parseNumberSafe } from '../numberUtils';

// ============================================================================
// TYPES
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  value?: number;
}

export interface LoadInputs {
  position?: number;
  magnitude?: number;
  startPosition?: number;
  endPosition?: number;
}

export interface LoadValidationResult extends ValidationResult {
  load?: Load;
}

// ============================================================================
// POSITION VALIDATION
// ============================================================================

export function validateLoadPosition(
  pos: string,
  beamLength: number,
  fieldName: string = 'Pozisyon'
): ValidationResult {
  const value = parseNumberSafe(pos);

  if (isNaN(value)) {
    return { isValid: false, error: `${fieldName} geçerli bir sayı olmalıdır` };
  }

  if (value < 0) {
    return { isValid: false, error: `${fieldName} negatif olamaz` };
  }

  if (value > beamLength) {
    return { isValid: false, error: `${fieldName} ${beamLength.toFixed(1)}m'den büyük olamaz` };
  }

  return { isValid: true, value };
}

export function validateLoadRange(
  start: string,
  end: string,
  beamLength: number
): ValidationResult & { startValue?: number; endValue?: number } {
  const startValue = parseNumberSafe(start);
  const endValue = parseNumberSafe(end);

  if (isNaN(startValue) || isNaN(endValue)) {
    return { isValid: false, error: 'Başlangıç ve bitiş geçerli sayılar olmalıdır' };
  }

  if (startValue < 0 || endValue > beamLength) {
    return {
      isValid: false,
      error: `Değerler 0 ile ${beamLength.toFixed(1)}m arasında olmalıdır`
    };
  }

  if (startValue >= endValue) {
    return { isValid: false, error: 'Başlangıç pozisyonu bitiş pozisyonundan küçük olmalıdır' };
  }

  return { isValid: true, startValue, endValue };
}

// ============================================================================
// MAGNITUDE VALIDATION
// ============================================================================

export function validateLoadMagnitude(
  mag: string,
  fieldName: string = 'Büyüklük'
): ValidationResult {
  const value = parseNumberSafe(mag);

  if (isNaN(value)) {
    return { isValid: false, error: `${fieldName} geçerli bir sayı olmalıdır` };
  }

  if (value <= 0) {
    return { isValid: false, error: `${fieldName} sıfırdan büyük olmalıdır` };
  }

  return { isValid: true, value };
}

// ============================================================================
// LOAD INPUT PARSER
// ============================================================================

export function parseLoadInputs(
  pos: string,
  mag: string,
  start?: string,
  end?: string
): LoadInputs {
  return {
    position: parseNumberSafe(pos),
    magnitude: parseNumberSafe(mag),
    startPosition: start ? parseNumberSafe(start) : undefined,
    endPosition: end ? parseNumberSafe(end) : undefined,
  };
}

// ============================================================================
// LOAD TYPE VALIDATION
// ============================================================================

export function validateLoadInputs(
  loadType: LoadType,
  pos: string,
  mag: string,
  start: string,
  end: string,
  beamLength: number
): LoadValidationResult {
  switch (loadType) {
    case LoadType.POINT:
    case LoadType.MOMENT: {
      const posResult = validateLoadPosition(pos, beamLength);
      if (!posResult.isValid) {
        return posResult;
      }

      const magResult = validateLoadMagnitude(mag);
      if (!magResult.isValid) {
        return magResult;
      }

      return { isValid: true };
    }

    case LoadType.UDL:
    case LoadType.TRIANGULAR: {
      const rangeResult = validateLoadRange(start, end, beamLength);
      if (!rangeResult.isValid) {
        return rangeResult;
      }

      const magResult = validateLoadMagnitude(mag, 'Şiddet');
      if (!magResult.isValid) {
        return magResult;
      }

      return { isValid: true };
    }

    default:
      return { isValid: false, error: 'Bilinmeyen yük tipi' };
  }
}

// ============================================================================
// TURKISH ERROR MESSAGES
// ============================================================================

export const ErrorMessages = {
  POSITION_INVALID: (beamLength: number) =>
    `Pozisyon 0 ile ${beamLength.toFixed(1)}m arasında olmalıdır`,
  POSITION_NEGATIVE: 'Pozisyon negatif olamaz',
  MAGNITUDE_INVALID: 'Büyüklük sıfırdan büyük olmalıdır',
  MAGNITUDE_NAN: 'Büyüklük geçerli bir sayı olmalıdır',
  RANGE_INVALID: (beamLength: number) =>
    `Başlangıç ve bitiş 0 ile ${beamLength.toFixed(1)}m arasında olmalıdır`,
  RANGE_ORDER: 'Başlangıç pozisyonu bitiş pozisyonundan küçük olmalıdır',
  INPUT_NAN: 'Geçerli bir sayı giriniz',
} as const;
