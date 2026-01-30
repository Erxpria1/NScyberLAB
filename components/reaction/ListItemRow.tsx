// ============================================================================
// LIST ITEM ROW COMPONENT
// Reusable row for support/load item lists
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography, Spacing } from '@/utils/theme';
import { RetroButton } from '@/components/retro';

// ============================================================================
// TYPES
// ============================================================================

export interface ListItemRowProps {
  title: string;
  subtitle: string;
  onRemove: () => void;
  style?: ViewStyle;
  removeLabel?: string;
  removeColor?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const ListItemRow: React.FC<ListItemRowProps> = ({
  title,
  subtitle,
  onRemove,
  style,
  removeLabel = 'X',
  removeColor = Colors.retro.primary,
}) => {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <RetroButton
        label={removeLabel}
        onPress={onRemove}
        color={removeColor}
        style={styles.removeBtn}
        labelStyle={styles.removeBtnText}
      />
    </View>
  );
};

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================

export interface EmptyListProps {
  message: string;
  style?: ViewStyle;
}

export const EmptyList: React.FC<EmptyListProps> = ({ message, style }) => {
  return <Text style={[styles.emptyText, style]}>{message}</Text>;
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    backgroundColor: Colors.black,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: Spacing.xs,
  },
  info: {
    flex: 1,
  },
  title: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    fontWeight: 'bold',
  },
  subtitle: {
    fontFamily: Typography.family.mono,
    fontSize: 10,
    color: Colors.retro.gray,
    marginTop: 2,
  },
  removeBtn: {
    width: 30,
    minWidth: 30,
    height: 30,
    minHeight: 30,
  },
  removeBtnText: {
    fontSize: 10,
  },
  emptyText: {
    fontFamily: Typography.family.mono,
    fontSize: 10,
    color: Colors.retro.gray,
    textAlign: 'center',
    padding: Spacing.md,
  },
});
