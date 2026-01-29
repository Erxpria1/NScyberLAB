import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Animated } from 'react-native';
import { Colors, Typography, Spacing } from '@/utils/theme';

interface RetroButtonProps {
  label: string;
  onPress?: () => void;
  variant?: 'yellow' | 'green' | 'blue' | 'orange' | 'red';
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
}

interface ButtonColorTheme {
  face: string;
  highlight: string;
  shadow: string;
  text: string;
}

const BUTTON_COLORS: Record<string, ButtonColorTheme> = {
  amber: {
    face: Colors.amber.primary, // #FFB000 (approx)
    highlight: '#FFC54D',
    shadow: '#B37B00',
    text: '#4D3500', 
  },
  dark: {
    face: Colors.gray[200], // #333333
    highlight: Colors.gray[300],
    shadow: '#1A1A1A',
    text: Colors.amber.primary,
  },
  orange: {
    face: Colors.amber.secondary, // Darker amber/orange
    highlight: '#FFBF40',
    shadow: '#8C5200',
    text: '#331E00',
  },
  gray: {
      face: '#888888',
      highlight: '#AAAAAA',
      shadow: '#555555',
      text: '#222222',
  }
};

export const RetroButton: React.FC<RetroButtonProps> = ({ 
  label, 
  onPress, 
  variant = 'amber',
  size = 'md',
  active = false
}) => {
  const [isPressed, setIsPressed] = React.useState(active);
  const pressAnim = React.useRef(new Animated.Value(active ? 1 : 0)).current;

  const colors = BUTTON_COLORS[variant];

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(pressAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    if (!active) {
      setIsPressed(false);
      Animated.spring(pressAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 50,
        bounciness: 0,
      }).start();
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
      case 'sm': return { width: 48, height: 48, fontSize: 10 };
      case 'lg': return { width: 160, height: 56, fontSize: 18 };
      default: return { width: 120, height: 48, fontSize: 14 };
    }
  };

  const dims = getDimensions();

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <View style={[styles.container, { width: dims.width, height: dims.height + 6 }]}>
        {/* Base / Shadow Layer */}
        <View style={[
          styles.base, 
          { 
            backgroundColor: '#D0C8B6', // Panel background color match
            borderColor: '#A8A090',
          }
        ]} />
        
        {/* Shadow Drop */}
        <Animated.View style={[
          styles.shadow,
          {
            backgroundColor: colors.shadow,
            transform: [{ scaleY: shadowScale }],
            opacity: shadowScale,
          }
        ]} />

        {/* Moving Button Face */}
        <Animated.View style={[
          styles.face,
          {
            backgroundColor: colors.face,
            transform: [{ translateY }],
            borderColor: colors.shadow,
          }
        ]}>
          {/* Inner Highlight (Bevel Top/Left) */}
          <View style={[styles.highlight, { borderColor: colors.highlight }]} />

          {/* Label with pixel/engraved effect */}
          <Text style={[
            styles.text, 
            { 
              color: colors.text,
              fontSize: dims.fontSize,
              // textShadowColor: 'rgba(255,255,255,0.3)',
              // textShadowOffset: { width: 1, height: 1 },
              // textShadowRadius: 0
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
    backgroundColor: '#E6E1D3', // Off-white panel color 
  },
  shadow: {
    position: 'absolute',
    bottom: 0,
    left: 2,
    right: 2,
    height: 10,
    borderRadius: 6,
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
    borderBottomWidth: 3, // Thicker bottom border for 3D effect
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
