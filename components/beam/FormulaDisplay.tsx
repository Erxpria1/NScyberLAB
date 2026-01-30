import React from 'react';
import { StyleSheet } from 'react-native';
import { MathRenderer } from '../math/MathRenderer';
import { Colors, Spacing } from '@/utils/theme';

interface FormulaDisplayProps {
  formula: string;
  fontSize?: number;
}

export const FormulaDisplay: React.FC<FormulaDisplayProps> = ({
  formula,
  fontSize = 22,
}) => {
  return (
    <MathRenderer
      formula={formula}
      displayMode={true}
      fontSize={fontSize}
      color={Colors.retro.accent}
      style={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.black,
    minHeight: 100,
    marginVertical: Spacing.md,
    padding: Spacing.sm,
  },
});

export default FormulaDisplay;
