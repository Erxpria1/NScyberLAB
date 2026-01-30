import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Colors, Typography, Spacing } from '@/utils/theme';
import { useThemeStore } from '@/store/useThemeStore';

interface RetroModeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const RetroModeToggle: React.FC<RetroModeToggleProps> = ({
  size = 'md',
  showLabel = true,
}) => {
  const { mode, toggleMode } = useThemeStore();
  const isRetro = mode === 'retro';

  const sizeStyles = {
    sm: { width: 44, height: 24, knobSize: 18 },
    md: { width: 56, height: 30, knobSize: 24 },
    lg: { width: 72, height: 36, knobSize: 28 },
  };

  const { width, height, knobSize } = sizeStyles[size];

  return (
    <View style={styles.container}>
      {showLabel && (
        <Text style={[styles.label, isRetro && styles.labelRetro]}>
          {isRetro ? 'RETRO' : 'CYBER'}
        </Text>
      )}
      <TouchableOpacity
        onPress={toggleMode}
        activeOpacity={0.8}
        style={[
          styles.toggle,
          { width, height },
          isRetro ? styles.toggleRetro : styles.toggleCyber,
        ]}
      >
        <View
          style={[
            styles.knob,
            {
              width: knobSize,
              height: knobSize,
              transform: [{ translateX: isRetro ? width - height - 4 : 4 }],
            },
            isRetro ? styles.knobRetro : styles.knobCyber,
          ]}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  label: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.amber.primary,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  labelRetro: {
    color: Colors.retro.primary,
  },
  toggle: {
    borderRadius: 999,
    borderWidth: 2,
    position: 'relative',
    transition: 'background-color 0.3s',
  },
  toggleCyber: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderColor: Colors.amber.primary,
  },
  toggleRetro: {
    backgroundColor: Colors.retro.dark,
    borderColor: Colors.retro.primary,
  },
  knob: {
    borderRadius: 999,
    position: 'absolute',
    top: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  knobCyber: {
    backgroundColor: Colors.amber.glow,
  },
  knobRetro: {
    backgroundColor: Colors.retro.accent,
  },
});
