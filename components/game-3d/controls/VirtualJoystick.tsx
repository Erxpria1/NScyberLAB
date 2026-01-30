import React, { useState, useRef } from 'react';
import { View, StyleSheet, PanResponder, Text, Dimensions } from 'react-native';
import { Colors, Typography, Spacing } from '@/utils/theme';
import { useThemeStore } from '@/store/useThemeStore';
import { RetroDpad } from '@/components/retro/RetroDpad';
import type { JoystickState } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface VirtualJoystickProps {
  size?: number;
  onMove: (x: number, y: number) => void;
  onRelease?: () => void;
  position?: 'left' | 'right';
}

const JOYSTICK_SIZE = 100;
const KNOB_SIZE = 40;
const MAX_DISTANCE = 30;

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  size = JOYSTICK_SIZE,
  onMove,
  onRelease,
  position = 'left',
}) => {
  const [state, setState] = useState<JoystickState>({
    x: 0,
    y: 0,
    active: false,
  });

  const centerRef = useRef({ x: 0, y: 0 });
  const { mode } = useThemeStore();
  const isRetroMode = mode === 'retro';

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => {
      const touch = event.nativeEvent;
      centerRef.current = { x: touch.locationX, y: touch.locationY };
      setState({ x: 0, y: 0, active: true });
    },
    onPanResponderMove: (event) => {
      const touch = event.nativeEvent;
      const dx = touch.locationX - centerRef.current.x;
      const dy = touch.locationY - centerRef.current.y;

      const distance = Math.sqrt(dx * dx + dy * dy);
      const clampedDistance = Math.min(distance, MAX_DISTANCE);

      const angle = Math.atan2(dy, dx);
      const x = Math.cos(angle) * clampedDistance / MAX_DISTANCE;
      const y = Math.sin(angle) * clampedDistance / MAX_DISTANCE;

      setState({ x, y, active: true });
      onMove(x, y);
    },
    onPanResponderRelease: () => {
      setState({ x: 0, y: 0, active: false });
      onRelease?.();
    },
  });

  const knobX = state.x * MAX_DISTANCE;
  const knobY = state.y * MAX_DISTANCE;

  const containerStyle = position === 'left'
    ? styles.leftContainer
    : styles.rightContainer;

  // Retro mode: show pixel art D-Pad
  if (isRetroMode) {
    const handleDirection = (direction: 'up' | 'down' | 'left' | 'right' | null) => {
      if (!direction) {
        setState({ x: 0, y: 0, active: false });
        onRelease?.();
        return;
      }

      const xValues = { left: -1, right: 1, up: 0, down: 0 };
      const yValues = { left: 0, right: 0, up: -1, down: 1 };

      setState({ x: xValues[direction], y: yValues[direction], active: true });
      onMove(xValues[direction], yValues[direction]);
    };

    return (
      <View style={containerStyle}>
        <RetroDpad
          size={size}
          onDirection={handleDirection}
          onRelease={onRelease}
        />
      </View>
    );
  }

  // Cyber mode: show original joystick
  return (
    <View style={containerStyle} {...panResponder.panHandlers}>
      {/* Base */}
      <View style={[styles.base, { width: size, height: size }]}>
        {/* Direction indicators */}
        <View style={styles.directionLabel}>
          <Text style={styles.directionText}>▲</Text>
        </View>
        <View style={[styles.directionLabel, styles.leftDirection]}>
          <Text style={styles.directionText}>◄</Text>
        </View>
        <View style={[styles.directionLabel, styles.rightDirection]}>
          <Text style={styles.directionText}>►</Text>
        </View>
        <View style={[styles.directionLabel, styles.bottomDirection]}>
          <Text style={styles.directionText}>▼</Text>
        </View>

        {/* Knob */}
        <View
          style={[
            styles.knob,
            {
              width: KNOB_SIZE,
              height: KNOB_SIZE,
              transform: [
                { translateX: knobX },
                { translateY: knobY },
              ],
            },
            state.active && styles.knobActive,
          ]}
        >
          <View style={styles.knobInner} />
        </View>
      </View>

      {/* Status indicator */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          X: {state.x.toFixed(2)} | Y: {state.y.toFixed(2)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  leftContainer: {
    position: 'absolute',
    left: Spacing.lg,
    bottom: Spacing.xl + 80,
    zIndex: 100,
  },
  rightContainer: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.xl + 80,
    zIndex: 100,
  },
  base: {
    borderRadius: JOYSTICK_SIZE / 2,
    backgroundColor: 'rgba(44, 44, 46, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 191, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  knob: {
    position: 'absolute',
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: 'rgba(255, 191, 0, 0.1)',
    borderWidth: 1.5,
    borderColor: Colors.amber.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.amber.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  knobActive: {
    backgroundColor: 'rgba(255, 191, 0, 0.3)',
    borderColor: Colors.amber.glow,
    transform: [{ scale: 1.1 }],
  },
  knobInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.amber.primary,
  },
  directionLabel: {
    position: 'absolute',
    top: 6,
  },
  leftDirection: {
    left: 6,
    top: undefined,
  },
  rightDirection: {
    right: 6,
    top: undefined,
  },
  bottomDirection: {
    bottom: 6,
    top: undefined,
  },
  directionText: {
    fontFamily: Typography.family.mono,
    fontSize: 9,
    color: 'rgba(255, 191, 0, 0.4)',
  },
  statusContainer: {
    marginTop: Spacing.md,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 191, 0, 0.2)',
  },
  statusText: {
    fontFamily: Typography.family.mono,
    fontSize: 8,
    color: Colors.amber.dim,
    letterSpacing: 1,
  },
});
