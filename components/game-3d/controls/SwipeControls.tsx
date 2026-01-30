import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, PanResponder, GestureResponderEvent } from 'react-native';
import { Colors } from '@/utils/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SwipeControlsProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onRotate?: (deltaX: number, deltaY: number) => void;
  onPinch?: (scale: number) => void;
  children: React.ReactNode;
  enabled?: boolean;
}

const SWIPE_THRESHOLD = 30;

export const SwipeControls: React.FC<SwipeControlsProps> = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onRotate,
  onPinch,
  children,
  enabled = true,
}) => {
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const lastXRef = useRef(0);
  const lastYRef = useRef(0);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => enabled,
    onMoveShouldSetPanResponder: () => enabled,
    onPanResponderStart: (event: GestureResponderEvent) => {
      startXRef.current = event.nativeEvent.locationX;
      startYRef.current = event.nativeEvent.locationY;
      lastXRef.current = event.nativeEvent.locationX;
      lastYRef.current = event.nativeEvent.locationY;
    },
    onPanResponderMove: (event: GestureResponderEvent) => {
      if (!enabled) return;

      const deltaX = event.nativeEvent.locationX - lastXRef.current;
      const deltaY = event.nativeEvent.locationY - lastYRef.current;

      lastXRef.current = event.nativeEvent.locationX;
      lastYRef.current = event.nativeEvent.locationY;

      // Call rotate callback for continuous rotation
      if (onRotate) {
        onRotate(deltaX, deltaY);
      }
    },
    onPanResponderRelease: (event: GestureResponderEvent) => {
      if (!enabled) return;

      const deltaX = event.nativeEvent.locationX - startXRef.current;
      const deltaY = event.nativeEvent.locationY - startYRef.current;

      // Detect swipe gestures
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
          if (deltaX > 0) {
            onSwipeRight?.();
          } else {
            onSwipeLeft?.();
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > SWIPE_THRESHOLD) {
          if (deltaY > 0) {
            onSwipeDown?.();
          } else {
            onSwipeUp?.();
          }
        }
      }
    },
  });

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {children}
    </View>
  );
};

// Pinch-to-zoom handler (two-finger gesture)
export const usePinchGesture = (onScale: (scale: number) => void) => {
  const initialDistanceRef = useRef(0);
  const initialScaleRef = useRef(1);

  const getDistance = (touch1: any, touch2: any): number => {
    const dx = touch1.pageX - touch2.pageX;
    const dy = touch1.pageY - touch2.pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderStart: (event: any) => {
      if (event.nativeEvent.touches.length === 2) {
        initialDistanceRef.current = getDistance(
          event.nativeEvent.touches[0],
          event.nativeEvent.touches[1]
        );
        initialScaleRef.current = 1;
      }
    },
    onPanResponderMove: (event: any) => {
      if (event.nativeEvent.touches.length === 2) {
        const currentDistance = getDistance(
          event.nativeEvent.touches[0],
          event.nativeEvent.touches[1]
        );
        const scale = currentDistance / initialDistanceRef.current;
        onScale(scale);
      }
    },
  });

  return panResponder;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});
