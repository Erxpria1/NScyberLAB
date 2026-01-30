import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '@/utils/theme';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepTitle,
}) => {
  const safeTotalSteps = totalSteps || 1;
  const progress = (currentStep / safeTotalSteps) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>PHASE: {currentStep.toString().padStart(2, '0')}</Text>
        </View>
        <Text style={styles.stepTitle} numberOfLines={1}>{stepTitle || ''}</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.bufferInfo}>
          <Text style={styles.bufferText}>BUFF_TRANSFER: {Math.round(progress)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
          
          <View style={styles.ticksContainer}>
            {Array.from({ length: totalSteps }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.tick,
                  index < currentStep && styles.tickActive,
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#050505',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  tag: {
    backgroundColor: Colors.amber.dim + '30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.amber.dim,
  },
  tagText: {
    fontFamily: Typography.family.mono,
    fontSize: 9,
    color: Colors.amber.primary,
    fontWeight: 'bold',
  },
  stepTitle: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.gray[800],
    flex: 1,
    textTransform: 'uppercase',
  },
  progressContainer: {
    gap: 4,
  },
  bufferInfo: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  bufferText: {
    fontFamily: Typography.family.mono,
    fontSize: 8,
    color: Colors.gray[500],
  },
  progressBar: {
    height: 10,
    backgroundColor: Colors.gray[150],
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.1)',
    position: 'relative',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.amber.primary,
    position: 'absolute',
    left: 0,
    top: 0,
    opacity: 0.8,
  },
  ticksContainer: {
    flexDirection: 'row',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  tick: {
    width: 2,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tickActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});

export default StepIndicator;
