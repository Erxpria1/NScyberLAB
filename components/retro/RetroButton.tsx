import React, { useRef, useMemo, useCallback, memo } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
  StyleProp,
  TextStyle,
} from 'react-native';
import { Colors, Typography } from '@/utils/theme';

interface RetroButtonProps {
  onPress: () => void;
  label: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}

export const RetroButton: React.FC<RetroButtonProps> = memo(({
  onPress,
  label,
  color = Colors.retro.accent,
  style,
  labelStyle,
  disabled,
}) => {
  // Lazy ref initialization - only created once
  const pushAnim = useRef<Animated.Value>(null);
  if (!pushAnim.current) {
    pushAnim.current = new Animated.Value(0);
  }

  const handlePressIn = useCallback(() => {
    if (pushAnim.current) {
      Animated.spring(pushAnim.current, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 5,
      }).start();
    }
  }, []);

  const handlePressOut = useCallback(() => {
    if (pushAnim.current) {
      Animated.spring(pushAnim.current, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 5,
      }).start();
    }
  }, []);

  // Memoize interpolate calculations
  const transform = useMemo(() => ({
    translateY: pushAnim.current!.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 3],
    }),
    translateX: pushAnim.current!.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 2],
    }),
  }), []);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={[styles.shadowBase, { backgroundColor: Colors.black }, style]}
    >
      <Animated.View
        style={[
          styles.buttonBody,
          {
            backgroundColor: disabled ? Colors.retro.gray : color,
            transform: [{ translateY: transform.translateY }, { translateX: transform.translateX }]
          }
        ]}
      >
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  shadowBase: {
    minHeight: 44,
    minWidth: 80,
    borderRadius: 2,
  },
  buttonBody: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: Colors.black,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
    // Add a slight top highlight for 3D feel
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.4)',
    borderLeftColor: 'rgba(255,255,255,0.2)',
  },
  label: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    fontWeight: 'bold',
    color: Colors.black,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
