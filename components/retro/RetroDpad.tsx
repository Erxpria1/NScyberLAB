import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Canvas, Path, Skia, Group } from '@shopify/react-native-skia';
import { Colors, Spacing } from '@/utils/theme';

export interface RetroDpadState {
  direction: 'up' | 'down' | 'left' | 'right' | null;
}

interface RetroDpadProps {
  size?: number;
  onDirection: (direction: 'up' | 'down' | 'left' | 'right' | null) => void;
  onRelease?: () => void;
}

const DPAD_SIZE = 120;
const BUTTON_SIZE = 36;

// Pixel art D-Pad path (drawn with Skia)
const createDpadPath = () => {
  const path = Skia.Path.Make();
  const s = DPAD_SIZE;
  const c = s / 2;
  const t = s / 6; // thickness

  // Center square
  path.addRect(Skia.XYWHRect(c - t/2, c - t/2, t, t));

  // Up arm
  path.addRect(Skia.XYWHRect(c - t/2, 0, t, c - t/2));

  // Down arm
  path.addRect(Skia.XYWHRect(c - t/2, c + t/2, t, c - t/2));

  // Left arm
  path.addRect(Skia.XYWHRect(0, c - t/2, c - t/2, t));

  // Right arm
  path.addRect(Skia.XYWHRect(c + t/2, c - t/2, c - t/2, t));

  return path;
};

const dpadPath = createDpadPath();

// Button highlight paths
const createButtonPath = (position: 'up' | 'down' | 'left' | 'right') => {
  const path = Skia.Path.Make();
  const s = BUTTON_SIZE;
  const offset = 4;

  switch (position) {
    case 'up':
      path.addRect(Skia.XYWHRect(offset, offset, s - 2*offset, s - 2*offset));
      break;
    case 'down':
      path.addRect(Skia.XYWHRect(offset, offset, s - 2*offset, s - 2*offset));
      break;
    case 'left':
      path.addRect(Skia.XYWHRect(offset, offset, s - 2*offset, s - 2*offset));
      break;
    case 'right':
      path.addRect(Skia.XYWHRect(offset, offset, s - 2*offset, s - 2*offset));
      break;
  }

  return path;
};

export const RetroDpad: React.FC<RetroDpadProps> = ({
  size = DPAD_SIZE,
  onDirection,
  onRelease,
}) => {
  const [activeDirection, setActiveDirection] = useState<'up' | 'down' | 'left' | 'right' | null>(null);
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = (direction: 'up' | 'down' | 'left' | 'right') => {
    setActiveDirection(direction);
    setIsPressed(true);
    onDirection(direction);
  };

  const handleRelease = () => {
    setActiveDirection(null);
    setIsPressed(false);
    onDirection(null);
    onRelease?.();
  };

  const scale = size / DPAD_SIZE;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Skia Canvas for pixel art D-Pad */}
      <Canvas style={[styles.canvas, { width: size, height: size }]}>
        <Group transform={[{ scale }]}>
          {/* Shadow */}
          <Path
            path={dpadPath}
            color="#0a0a0a"
            transform={[{ translateX: 4 }, { translateY: 4 }]}
          />
          {/* Main D-Pad body */}
          <Path
            path={dpadPath}
            color={activeDirection ? Colors.retro.gray : Colors.retro.dark}
          />
          {/* D-Pad border */}
          <Path
            path={dpadPath}
            color={Colors.retro.lightGray}
            style="stroke"
            strokeWidth={2}
          />
        </Group>
      </Canvas>

      {/* Touch zones */}
      <View style={styles.touchZones}>
        <TouchableOpacity
          style={[styles.touchButton, styles.upButton]}
          onPressIn={() => handlePress('up')}
          onPressOut={handleRelease}
          activeOpacity={0.8}
        >
          <View style={[
            styles.buttonHighlight,
            activeDirection === 'up' && styles.buttonHighlightActive
          ]}>
            <Text style={styles.arrow}>▲</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.middleRow}>
          <TouchableOpacity
            style={[styles.touchButton, styles.sideButton]}
            onPressIn={() => handlePress('left')}
            onPressOut={handleRelease}
            activeOpacity={0.8}
          >
            <View style={[
              styles.buttonHighlight,
              activeDirection === 'left' && styles.buttonHighlightActive
            ]}>
              <Text style={styles.arrow}>◄</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.centerDot} />

          <TouchableOpacity
            style={[styles.touchButton, styles.sideButton]}
            onPressIn={() => handlePress('right')}
            onPressOut={handleRelease}
            activeOpacity={0.8}
          >
            <View style={[
              styles.buttonHighlight,
              activeDirection === 'right' && styles.buttonHighlightActive
            ]}>
              <Text style={styles.arrow}>►</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.touchButton, styles.downButton]}
          onPressIn={() => handlePress('down')}
          onPressOut={handleRelease}
          activeOpacity={0.8}
        >
          <View style={[
            styles.buttonHighlight,
            activeDirection === 'down' && styles.buttonHighlightActive
          ]}>
            <Text style={styles.arrow}>▼</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  canvas: {
    position: 'absolute',
  },
  touchZones: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  touchButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  upButton: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -BUTTON_SIZE / 2,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
  downButton: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    marginLeft: -BUTTON_SIZE / 2,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
  middleRow: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    marginTop: -BUTTON_SIZE / 2,
    justifyContent: 'center',
  },
  sideButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
  centerDot: {
    width: 20,
    height: 20,
  },
  buttonHighlight: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  buttonHighlightActive: {
    backgroundColor: 'rgba(255, 204, 0, 0.3)',
  },
  arrow: {
    fontSize: 18,
    color: Colors.retro.accent,
    fontFamily: 'Courier New',
    fontWeight: 'bold',
    textShadowColor: Colors.retro.dark,
    textShadowOffset: { width: 1, height: 1 },
  },
});
