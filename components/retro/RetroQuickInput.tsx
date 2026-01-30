// ============================================================================
// RETRO QUICK INPUT COMPONENT
// Input field with quick value chips (44px touch targets)
// ============================================================================

import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { Colors, Typography, Spacing } from '@/utils/theme';

// ============================================================================
// TYPES
// ============================================================================

export interface RetroQuickInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  quickValues?: number[];
  quickValueLabels?: string[];
  placeholder?: string;
  error?: string;
  keyboardType?: 'decimal-pad' | 'numeric' | 'number-pad';
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const RetroQuickInput: React.FC<RetroQuickInputProps> = ({
  label,
  value,
  onChangeText,
  quickValues = [],
  quickValueLabels,
  placeholder,
  error,
  keyboardType = 'decimal-pad',
  style,
  inputStyle,
}) => {
  const hasError = !!error;

  const handleQuickValue = (val: number) => {
    onChangeText(val.toString());
  };

  return (
    <View style={style}>
      {/* Label */}
      <Text style={styles.label}>{label}</Text>

      {/* Input */}
      <TextInput
        style={[styles.input, hasError && styles.inputError, inputStyle]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={Colors.retro.gray}
      />

      {/* Error message */}
      {hasError && <Text style={styles.errorText}>{error}</Text>}

      {/* Quick value chips */}
      {quickValues.length > 0 && (
        <View style={styles.quickChipsRow}>
          {quickValues.map((val, index) => (
            <TouchableOpacity
              key={val}
              style={styles.quickChip}
              onPress={() => handleQuickValue(val)}
              activeOpacity={0.7}
            >
              <Text style={styles.quickChipText}>
                {quickValueLabels?.[index] ?? val.toString()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// ============================================================================
// POSITION QUICK INPUT (with L/4, L/2, etc.)
// ============================================================================

export interface RetroPositionInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  beamLength: number;
  positionRatios?: number[];
  style?: ViewStyle;
  inputStyle?: TextStyle;
  error?: string;
}

export const RetroPositionInput: React.FC<RetroPositionInputProps> = ({
  label,
  value,
  onChangeText,
  beamLength,
  positionRatios = [0, 0.25, 0.5, 0.75, 1],
  style,
  inputStyle,
  error,
}) => {
  const hasError = !!error;

  const formatRatioLabel = (ratio: number): string => {
    if (ratio === 0) return '0';
    if (ratio === 1) return 'L';
    return `${ratio}L`;
  };

  const handleQuickPosition = (ratio: number) => {
    const pos = ratio * beamLength;
    onChangeText(pos.toFixed(2));
  };

  return (
    <View style={style}>
      <Text style={styles.label}>{label}</Text>

      {/* Visual Slider Representation */}
      <View style={styles.sliderVisualContainer}>
        <Text style={styles.sliderLimitText}>0m</Text>
        <View style={styles.sliderTrackLine}>
          <View style={[styles.sliderFill, { width: `${Math.min(100, (parseFloat(value) || 0) / beamLength * 100)}%` }]} />
          <View style={[styles.sliderKnob, { left: `${Math.min(100, (parseFloat(value) || 0) / beamLength * 100)}%` }]} />
        </View>
        <Text style={styles.sliderLimitText}>{beamLength.toFixed(1)}m</Text>
      </View>

      <TextInput
        style={[styles.input, hasError && styles.inputError, inputStyle]}
        value={value}
        onChangeText={onChangeText}
        keyboardType="decimal-pad"
        placeholder={`0 - ${beamLength.toFixed(1)}`}
        placeholderTextColor={Colors.retro.gray}
      />
      {hasError && <Text style={styles.errorText}>{error}</Text>}
      <View style={styles.quickChipsRow}>
        {positionRatios.map((ratio) => (
          <TouchableOpacity
            key={ratio}
            style={styles.quickChip}
            onPress={() => handleQuickPosition(ratio)}
            activeOpacity={0.7}
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          >
            <Text style={styles.quickChipText}>{formatRatioLabel(ratio)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// ============================================================================
// RANGE INPUT (for UDL/Triangular loads)
// ============================================================================

export interface RetroRangeInputProps {
  startLabel?: string;
  endLabel?: string;
  startValue: string;
  endValue: string;
  onStartChange: (text: string) => void;
  onEndChange: (text: string) => void;
  beamLength: number;
  error?: string;
  style?: ViewStyle;
}

export const RetroRangeInput: React.FC<RetroRangeInputProps> = ({
  startLabel = 'Başlangıç (m)',
  endLabel = 'Bitiş (m)',
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  beamLength,
  error,
  style,
}) => {
  return (
    <View style={style}>
      <Text style={styles.label}>{startLabel}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={startValue}
        onChangeText={onStartChange}
        keyboardType="decimal-pad"
        placeholder="0.00"
        placeholderTextColor={Colors.retro.gray}
      />

      <Text style={styles.label}>{endLabel}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={endValue}
        onChangeText={onEndChange}
        keyboardType="decimal-pad"
        placeholder={beamLength.toFixed(2)}
        placeholderTextColor={Colors.retro.gray}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  label: {
    fontFamily: Typography.family.mono,
    fontSize: 10,
    color: Colors.retro.text,
    marginTop: Spacing.md,
    marginBottom: 4,
  },
  input: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    backgroundColor: Colors.black,
    borderWidth: 2,
    borderColor: Colors.retro.gray,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    minHeight: 44, // iOS touch target minimum
  },
  inputError: {
    borderColor: Colors.retro.primary,
  },
  errorText: {
    fontFamily: Typography.family.mono,
    fontSize: 10,
    color: Colors.retro.primary,
    marginTop: 4,
  },
  quickChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  quickChip: {
    backgroundColor: Colors.black,
    borderWidth: 1,
    borderColor: Colors.retro.gray,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 2,
    marginRight: 4,
    marginBottom: 4,
    minHeight: 44,
    minWidth: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickChipText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.white,
    fontWeight: '900',
  },
  // Visual Slider Styles
  sliderVisualContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    paddingHorizontal: 4,
  },
  sliderLimitText: {
    fontFamily: Typography.family.mono,
    fontSize: 9,
    color: Colors.retro.gray,
    minWidth: 25,
  },
  sliderTrackLine: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.retro.dark,
    marginHorizontal: 8,
    position: 'relative',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: Colors.amber.primary,
    opacity: 0.3,
  },
  sliderKnob: {
    position: 'absolute',
    width: 10,
    height: 10,
    backgroundColor: Colors.amber.secondary,
    borderRadius: 5,
    marginLeft: -5,
    borderWidth: 1,
    borderColor: Colors.black,
    zIndex: 2,
  },
});
