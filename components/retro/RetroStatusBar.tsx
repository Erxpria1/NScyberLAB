import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Canvas, Rect, Skia } from '@shopify/react-native-skia';
import { useTerminalStore } from '@/store/useTerminalStore';
import { useEducationStore } from '@/store/useEducationStore';
import { useReactionStore } from '@/store/useReactionStore';
import { Colors, Spacing, Typography } from '@/utils/theme';

interface StatusBarItem {
  label: string;
  value: number;
  max: number;
  color: string;
}

const BAR_WIDTH = 100;
const BAR_HEIGHT = 8;
const SEGMENT_SIZE = 4;

// Create pixelated bar segments
const createBarSegments = (filled: number, total: number, color: string) => {
  const segments: React.ReactNode[] = [];
  const gap = 1;

  for (let i = 0; i < total; i++) {
    const x = i * (SEGMENT_SIZE + gap);
    const isFilled = i < filled;
    segments.push(
      <Rect
        key={i}
        x={x}
        y={0}
        width={SEGMENT_SIZE}
        height={BAR_HEIGHT}
        color={isFilled ? color : Colors.retro.gray}
      />
    );
  }

  return segments;
};

const calculateLoadCapacity = () => {
  const { loads, beamLength } = useReactionStore.getState();
  if (!loads.length) return 0;

  const totalLoad = loads.reduce((sum, load) => {
    if ('magnitude' in load) {
      return sum + load.magnitude;
    }
    if ('startMagnitude' in load && 'endMagnitude' in load) {
      return sum + (load.startMagnitude + load.endMagnitude) / 2;
    }
    return sum;
  }, 0);

  // Assume max capacity is 10 units for visualization
  return Math.min((totalLoad / 10) * 100, 100);
};

const calculateXPProgress = () => {
  const { progress, getXPForNextLevel } = useEducationStore.getState();
  const currentLevelXP = progress.level * 100; // Simplified
  const xpInLevel = progress.xpPoints - currentLevelXP;
  const xpNeeded = 100; // Fixed per level for simplicity
  return (xpInLevel / xpNeeded) * 100;
};

interface RetroStatusBarProps {
  showLoad?: boolean;
  showXP?: boolean;
  showBattery?: boolean;
}

export const RetroStatusBar: React.FC<RetroStatusBarProps> = ({
  showLoad = true,
  showXP = true,
  showBattery = true,
}) => {
  const battery = useTerminalStore((state) => state.status.battery);
  const xp = useEducationStore((state) => state.progress.xpPoints);
  const level = useEducationStore((state) => state.progress.level);
  const loads = useReactionStore((state) => state.loads);

  // Calculate bar values
  const loadValue = calculateLoadCapacity();
  const xpValue = calculateXPProgress();
  const batteryValue = battery;

  const numSegments = Math.floor(BAR_WIDTH / (SEGMENT_SIZE + 1));
  const loadSegments = Math.floor((loadValue / 100) * numSegments);
  const xpSegments = Math.floor((xpValue / 100) * numSegments);
  const batterySegments = Math.floor((batteryValue / 100) * numSegments);

  const renderBar = (label: string, value: number, filledSegments: number, color: string) => (
    <View style={styles.barContainer}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barWrapper}>
        <Canvas style={{ width: BAR_WIDTH, height: BAR_HEIGHT }}>
          {/* Background */}
          <Rect
            x={0}
            y={0}
            width={BAR_WIDTH}
            height={BAR_HEIGHT}
            color={Colors.retro.dark}
          />
          {/* Border */}
          <Rect
            x={0}
            y={0}
            width={BAR_WIDTH}
            height={BAR_HEIGHT}
            color={Colors.retro.lightGray}
            style="stroke"
            strokeWidth={1}
          />
          {/* Segments - we'll draw these with individual rects */}
          <React.Fragment>
            {Array.from({ length: numSegments }).map((_, i) => (
              <Rect
                key={i}
                x={i * (SEGMENT_SIZE + 1)}
                y={1}
                width={SEGMENT_SIZE}
                height={BAR_HEIGHT - 2}
                color={i < filledSegments ? color : Colors.retro.gray}
              />
            ))}
          </React.Fragment>
        </Canvas>
        <Text style={styles.barValue}>{Math.round(value)}%</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Pixel border background */}
      <View style={styles.background}>
        <View style={styles.innerContent}>
          {showLoad && renderBar('LOAD', loadValue, loadSegments, Colors.retro.barLoad)}
          {showXP && renderBar(`XP L${level}`, xpValue, xpSegments, Colors.retro.barXP)}
          {showBattery && renderBar('PWR', batteryValue, batterySegments, Colors.retro.barBattery)}
        </View>
      </View>
    </View>
  );
};

// Compact version for smaller spaces
export const RetroStatusBarCompact: React.FC = () => {
  const battery = useTerminalStore((state) => state.status.battery);
  const xp = useEducationStore((state) => state.progress.xpPoints);
  const level = useEducationStore((state) => state.progress.level);

  const xpValue = calculateXPProgress();
  const batteryValue = battery;

  return (
    <View style={styles.compactContainer}>
      <Text style={styles.compactText}>
        L{level} XP:{Math.round(xpValue)}% PWR:{batteryValue}%
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.sm,
  },
  background: {
    backgroundColor: Colors.retro.bg,
    borderWidth: 2,
    borderColor: Colors.retro.lightGray,
    padding: Spacing.sm,
  },
  innerContent: {
    gap: Spacing.sm,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  barLabel: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.retro.text,
    width: 50,
    fontWeight: 'bold',
  },
  barWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  barValue: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.retro.accent,
    width: 32,
    textAlign: 'right',
  },
  compactContainer: {
    backgroundColor: Colors.retro.bg,
    borderWidth: 1,
    borderColor: Colors.retro.lightGray,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  compactText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.retro.text,
    letterSpacing: 1,
  },
});
