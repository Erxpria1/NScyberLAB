import React from 'react';
import { MathRenderer } from './MathRenderer';
import { Colors } from '@/utils/theme';

interface MathProps {
  formula: string;
  inline?: boolean;
  block?: boolean;
  size?: number;
  color?: string;
  style?: any;
}

/**
 * High-level Math component for easy LaTeX usage
 * Usage: <Math formula="E = mc^2" block />
 */
export const Math: React.FC<MathProps> = ({
  formula,
  inline = true,
  block = false,
  size,
  color,
  style,
}) => {
  const displayMode = block || !inline;
  
  return (
    <MathRenderer
      formula={formula}
      displayMode={displayMode}
      fontSize={size}
      color={color || Colors.amber.primary}
      style={style}
    />
  );
};

export default Math;
