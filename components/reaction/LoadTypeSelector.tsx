// ============================================================================
// LOAD TYPE SELECTOR COMPONENT
// 2x2 grid of load type buttons with 60px touch targets
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing } from '@/utils/theme';
import { LoadType } from '@/utils/structural/reactionCalculator';

// ============================================================================
// TYPES
// ============================================================================

export interface LoadTypeSelectorProps {
  selected: LoadType;
  onSelect: (type: LoadType) => void;
  label?: string;
}

// ============================================================================
// LOAD TYPE CONFIG
// ============================================================================

const LOAD_TYPES = [
  { type: LoadType.POINT, label: 'Nokta', short: 'P', description: 'Tek noktaya etki eden yük' },
  { type: LoadType.UDL, label: 'Yayılı', short: 'w', description: 'Yayılan homojen yük' },
  { type: LoadType.MOMENT, label: 'Moment', short: 'M', description: 'Döndürücü moment' },
  { type: LoadType.TRIANGULAR, label: 'Üçgen', short: '△', description: 'Değişken yayılı yük' },
] as const;

// ============================================================================
// COMPONENT
// ============================================================================

export const LoadTypeSelector: React.FC<LoadTypeSelectorProps> = ({
  selected,
  onSelect,
  label = 'Yük Tipi',
}) => {
  return (
    <View>
      <Text style={styles.sectionLabel}>{label}:</Text>
      <View style={styles.grid}>
        {LOAD_TYPES.map((loadType) => {
          const isActive = selected === loadType.type;
          return (
            <TouchableOpacity
              key={loadType.type}
              style={[styles.gridButton, isActive && styles.gridButtonActive]}
              onPress={() => onSelect(loadType.type)}
              activeOpacity={0.7}
              accessibilityLabel={`${loadType.label} Yük`}
              accessibilityState={{ selected: isActive }}
            >
              <Text
                style={[styles.gridButtonIcon, isActive && styles.gridButtonIconActive]}
              >
                {loadType.short}
              </Text>
              <Text style={[styles.gridButtonLabel, isActive && styles.gridButtonLabelActive]}>
                {loadType.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// ============================================================================
// SUPPORT TYPE SELECTOR (for AddSupportModal)
// ============================================================================

import { SupportType } from '@/utils/structural/reactionCalculator';

export interface SupportTypeSelectorProps {
  selected: SupportType;
  onSelect: (type: SupportType) => void;
  label?: string;
}

const SUPPORT_TYPES = [
  { type: SupportType.FIXED, label: 'SABİT', icon: '▬' },
  { type: SupportType.PINNED, label: 'MAFSALLI', icon: '△' },
  { type: SupportType.ROLLER, label: 'HAREK.', icon: '○' },
] as const;

export const SupportTypeSelector: React.FC<SupportTypeSelectorProps> = ({
  selected,
  onSelect,
  label = 'TİP SEÇİMİ',
}) => {
  return (
    <View>
      <Text style={styles.sectionLabel}>{label}:</Text>
      <View style={styles.supportRow}>
        {SUPPORT_TYPES.map((supportType) => {
          const isActive = selected === supportType.type;
          return (
            <TouchableOpacity
              key={supportType.type}
              style={[styles.supportButton, isActive && styles.supportButtonActive]}
              onPress={() => onSelect(supportType.type)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.supportButtonIcon, isActive && styles.supportButtonIconActive]}
              >
                {supportType.icon}
              </Text>
              <Text
                style={[styles.supportButtonText, isActive && styles.supportButtonTextActive]}
              >
                {supportType.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  sectionLabel: {
    fontFamily: Typography.family.mono,
    fontSize: 10,
    color: Colors.retro.text,
    marginTop: Spacing.md,
    marginBottom: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.xs,
    gap: Spacing.xs,
  },
  gridButton: {
    width: '48%',
    aspectRatio: 1.5,
    backgroundColor: Colors.retro.dark,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.black,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    minHeight: 64, // 60px minimum + padding
  },
  gridButtonActive: {
    backgroundColor: Colors.amber.secondary || '#FF8800',
    borderColor: Colors.black,
    shadowColor: Colors.amber.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  gridButtonIcon: {
    fontFamily: Typography.family.mono,
    fontSize: 24,
    color: Colors.retro.text,
    marginBottom: 4,
  },
  gridButtonIconActive: {
    color: Colors.white,
    textShadowColor: Colors.black,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  gridButtonLabel: {
    fontFamily: Typography.family.mono,
    fontSize: 10,
    color: Colors.retro.text,
  },
  gridButtonLabelActive: {
    color: Colors.white,
    fontWeight: 'bold',
  },

  // Support selector styles (horizontal row)
  supportRow: {
    flexDirection: 'row',
    marginTop: Spacing.xs,
    gap: Spacing.xs,
  },
  supportButton: {
    flex: 1,
    padding: Spacing.sm,
    backgroundColor: Colors.black,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.black,
    marginRight: Spacing.xs,
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
  },
  supportButtonActive: {
    backgroundColor: Colors.amber.primary,
    borderColor: Colors.black,
  },
  supportButtonIcon: {
    fontSize: 16,
    color: Colors.retro.text,
    marginBottom: 2,
  },
  supportButtonIconActive: {
    color: Colors.white,
  },
  supportButtonText: {
    fontFamily: Typography.family.mono,
    fontSize: 9,
    color: Colors.retro.text,
    textAlign: 'center',
  },
  supportButtonTextActive: {
    color: Colors.white,
    fontWeight: 'bold',
  },
});
