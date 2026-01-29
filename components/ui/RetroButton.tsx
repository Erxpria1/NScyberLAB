import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Animated } from 'react-native';
import { Colors, Typography, Spacing } from '@/utils/theme';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'amber' | 'dark' | 'orange' | 'gray';
type ButtonSize = 'sm' | 'md' | 'lg';

interface RetroButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  active?: boolean;
  disabled?: boolean;
}

interface ButtonColorTheme {
  face: string;
  highlight: string;
  shadow: string;
  text: string;
}

const BUTTON_COLORS: Record<string, ButtonColorTheme> = {
  // Primary - Amber with CRT glow
  primary: {
    face: Colors.amber.primary,
    highlight: '#FFC54D',
    shadow: '#B37B00',
    text: '#4D3500',
  },
  // Secondary - Dark terminal style
  secondary: {
    face: Colors.gray[200],
    highlight: Colors.gray[300],
    shadow: '#1A1A1A',
    text: Colors.amber.primary,
  },
  // Tertiary - Subtle gray
  tertiary: {
    face: Colors.gray[400],
    highlight: '#888888',
    shadow: '#555555',
    text: '#222222',
  },
  // Legacy variants for backward compatibility
  amber: {
    face: Colors.amber.primary,
    highlight: '#FFC54D',
    shadow: '#B37B00',
    text: '#4D3500',
  },
  dark: {
    face: Colors.gray[200],
    highlight: Colors.gray[300],
    shadow: '#1A1A1A',
    text: Colors.amber.primary,
  },
  orange: {
    face: Colors.amber.secondary,
    highlight: '#FFBF40',
    shadow: '#8C5200',
    text: '#331E00',
  },
  gray: {
    face: '#888888',
    highlight: '#AAAAAA',
    shadow: '#555555',
    text: '#222222',
  },
};

export const RetroButton: React.FC<RetroButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  active = false,
  disabled = false,
}) => {
  const [isPressed, setIsPressed] = React.useState(active);
  const pressAnim = React.useRef(new Animated.Value(active ? 1 : 0)).current;
  const glowAnim = React.useRef(new Animated.Value(0)).current;

  const colors = BUTTON_COLORS[variant] || BUTTON_COLORS.primary;
  const isPrimary = variant === 'primary' || variant === 'amber';

  const handlePressIn = () => {
    if (disabled) return;
    setIsPressed(true);
    Animated.parallel([
      Animated.spring(pressAnim, {
        toValue: 1,
        useNativeDriver: true,
        damping: 8,
        stiffness: 400,
      }),
      Animated.timing(glowAnim, {
        toValue: isPrimary ? 0.8 : 0.4,
        duration: 100,
        useNativeDriver: false, // Cannot use native driver for shadow props
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    if (!active) {
      setIsPressed(false);
      Animated.parallel([
        Animated.spring(pressAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 8,
          stiffness: 400,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false, // Cannot use native driver for shadow props
        }),
      ]).start();
    }
  };

  const translateY = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 4], // Move down by 4 pixels when pressed
  });

  const shadowScale = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.1], // Shadow disappears when pressed
  });

  const getDimensions = () => {
    switch(size) {
      case 'sm': return { width: 56, height: 48, fontSize: 11 };
      case 'lg': return { width: 160, height: 56, fontSize: 16 };
      default: return { width: 120, height: 48, fontSize: 13 };
    }
  };

  const dims = getDimensions();

  const disabledOpacity = disabled ? 0.5 : 1;
  const disabledDepth = disabled ? 1 : 0; // No depth change when disabled

  return (
    <TouchableWithoutFeedback
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <View style={[styles.container, { width: dims.width, height: dims.height + 6, opacity: disabledOpacity }]}>
        {/* Base / Shadow Layer */}
        <View style={[
          styles.base,
          {
            backgroundColor: '#D0C8B6',
            borderColor: '#A8A090',
          }
        ]} />

        {/* Shadow Drop with depth change for disabled state */}
        <Animated.View style={[
          styles.shadow,
          {
            backgroundColor: colors.shadow,
            transform: [{ scaleY: shadowScale }, { translateY: disabled ? 2 : 0 }],
            opacity: disabled ? 1 : shadowScale,
          }
        ]} />

        {/* CRT Glow for primary variant */}
        {isPrimary && (
          <Animated.View style={[
            styles.crtGlow,
            {
              opacity: glowAnim,
              shadowColor: Colors.amber.glow,
              shadowOpacity: glowAnim,
              shadowRadius: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 16],
              }),
            },
          ]} />
        )}

        {/* Moving Button Face */}
        <Animated.View style={[
          styles.face,
          {
            backgroundColor: disabled ? Colors.gray[400] : colors.face,
            transform: [{ translateY }],
            borderColor: colors.shadow,
          }
        ]}>
          {/* Inner Highlight (Bevel Top/Left) */}
          <View style={[styles.highlight, { borderColor: colors.highlight }]} />

          {/* Label */}
          <Text style={[
            styles.text,
            {
              color: disabled ? Colors.gray[500] : colors.text,
              fontSize: dims.fontSize,
            }
          ]}>
            {label}
          </Text>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 4,
  },
  base: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 6,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: '#E6E1D3',
  },
  shadow: {
    position: 'absolute',
    bottom: 0,
    left: 2,
    right: 2,
    height: 10,
    borderRadius: 6,
  },
  crtGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 6,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  face: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 6,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 3,
  },
  highlight: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: 4,
    borderLeftWidth: 1,
    borderTopWidth: 1,
    opacity: 0.6,
  },
  text: {
    fontFamily: Typography.family.mono,
    fontWeight: 'bold',
    letterSpacing: 1,
  }
});
