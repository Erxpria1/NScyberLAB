import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Canvas,
  Path,
  Circle,
  Line,
  Group,
  Skia,
  vec,
  type Color,
} from '@shopify/react-native-skia';

// ============================================================================
// SUPPORT ICONS (Mesnet İkonları)
// ============================================================================

export const PinnedSupportIcon: React.FC<{ 
  size?: number;
  width?: number;
  height?: number;
  color?: Color;
}> = ({ 
  size = 20, 
  width = size,
  height = size,
  color = '#FFB000'
}) => {
  const path = useMemo(() => {
    const p = Skia.Path.Make();
    p.moveTo(12, 2);
    p.lineTo(12, 22);
    p.moveTo(8, 18);
    p.lineTo(12, 22);
    p.lineTo(16, 18);
    return p;
  }, []);
  
  return (
    <View style={styles.iconContainer}>
      <Canvas style={{ width, height }}>
        <Path
          path={path}
          color={color}
          style="stroke"
          strokeWidth={2}
        />
      </Canvas>
    </View>
  );
};

export const RollerSupportIcon: React.FC<{ 
  size?: number;
  width?: number;
  height?: number;
  color?: Color;
}> = ({ 
  size = 20, 
  width = size,
  height = size,
  color = '#FFB000'
}) => {
  return (
    <View style={styles.iconContainer}>
      <Canvas style={{ width, height }}>
        <Circle
          cx={12}
          cy={19}
          r={5}
          color={color}
          style="stroke"
          strokeWidth={2}
        />
        <Line
          p1={vec(7, 19)}
          p2={vec(17, 19)}
          color={color}
          strokeWidth={2}
        />
      </Canvas>
    </View>
  );
};

export const FixedSupportIcon: React.FC<{ 
  size?: number;
  width?: number;
  height?: number;
  color?: Color;
}> = ({ 
  size = 20, 
  width = size,
  height = size,
  color = '#FFB000'
}) => {
  const path = useMemo(() => {
    const p = Skia.Path.Make();
    p.moveTo(4, 22);
    p.lineTo(20, 22);
    p.moveTo(4, 22);
    p.lineTo(8, 14);
    p.moveTo(12, 22);
    p.lineTo(12, 14);
    p.moveTo(20, 22);
    p.lineTo(16, 14);
    return p;
  }, []);
  
  return (
    <View style={styles.iconContainer}>
      <Canvas style={{ width, height }}>
        <Path
          path={path}
          color={color}
          style="stroke"
          strokeWidth={2}
        />
      </Canvas>
    </View>
  );
};

// ============================================================================
// LOAD ICONS (Yük İkonları)
// ============================================================================

export const PointLoadIcon: React.FC<{ 
  direction: 'down' | 'up'; 
  size?: number;
  width?: number;
  height?: number;
  magnitude?: number;
  color?: Color;
  labelColor?: Color;
}> = ({ 
  direction, 
  size = 20, 
  width = size,
  height = size,
  magnitude,
  color = '#FFB000',
  labelColor = '#FFB000'
}) => {
  const label = magnitude ? `${Math.abs(magnitude).toFixed(1)}kN` : '';
  
  const arrowPath = useMemo(() => {
    const p = Skia.Path.Make();
    if (direction === 'down') {
      p.moveTo(10, 6);
      p.lineTo(6, 12);
      p.moveTo(10, 6);
      p.lineTo(14, 12);
      p.moveTo(10, 6);
      p.lineTo(10, 18);
    } else {
      p.moveTo(10, 18);
      p.lineTo(6, 12);
      p.moveTo(10, 18);
      p.lineTo(14, 12);
      p.moveTo(10, 18);
      p.lineTo(10, 6);
    }
    return p;
  }, [direction]);
  
  return (
    <View style={styles.pointLoadContainer}>
      <Canvas style={{ width, height }}>
        <Path
          path={arrowPath}
          color={color}
          style="stroke"
          strokeWidth={2}
        />
      </Canvas>
      {label && (
        <Text style={[styles.pointLoadLabel, { color: labelColor as string }]}>
          {direction === 'down' ? '↓' : '↑'}
          {label}
        </Text>
      )}
    </View>
  );
};

export const UDLIcon: React.FC<{ 
  direction: 'down' | 'up'; 
  size?: number;
  width?: number;
  height?: number;
  label?: string;
  color?: Color;
  labelColor?: Color;
}> = ({ 
  direction, 
  size = 20, 
  width = 100,
  height = 24,
  label,
  color = '#FFB000',
  labelColor = '#FFB000'
}) => {
  const arrowPath = useMemo(() => {
    const p = Skia.Path.Make();
    const spacing = width / 5;
    for (let i = 1; i <= 4; i++) {
      const x = i * spacing;
      if (direction === 'down') {
        p.moveTo(x, 4);
        p.lineTo(x, height - 4);
        p.moveTo(x - 3, height - 8);
        p.lineTo(x, height - 4);
        p.lineTo(x + 3, height - 8);
      } else {
        p.moveTo(x, height - 4);
        p.lineTo(x, 4);
        p.moveTo(x - 3, 8);
        p.lineTo(x, 4);
        p.lineTo(x + 3, 8);
      }
    }
    // Top line
    p.moveTo(spacing, direction === 'down' ? 4 : height - 4);
    p.lineTo(4 * spacing, direction === 'down' ? 4 : height - 4);
    return p;
  }, [direction, width, height]);
  
  return (
    <View style={styles.udlContainer}>
      <Canvas style={{ width, height }}>
        <Path
          path={arrowPath}
          color={color}
          style="stroke"
          strokeWidth={1.5}
        />
      </Canvas>
      {label && (
        <Text style={[styles.udlLabel, { color: labelColor as string }]}>
          {direction === 'down' ? '↓↓↓' : '↑↑↑'} {label}
        </Text>
      )}
    </View>
  );
};

export const MomentIcon: React.FC<{ 
  direction: 'clockwise' | 'counterclockwise'; 
  size?: number;
  width?: number;
  height?: number;
  magnitude?: number;
  color?: Color;
  labelColor?: Color;
}> = ({ 
  direction, 
  size = 20, 
  width = 30,
  height = 30,
  magnitude,
  color = '#FFB000',
  labelColor = '#FFB000'
}) => {
  const label = magnitude ? `${magnitude.toFixed(1)}kNm` : '';
  
  const arcPath = useMemo(() => {
    const p = Skia.Path.Make();
    // Draw arc
    p.moveTo(width / 2 - 8, height / 2);
    p.addArc({ x: width / 2 - 10, y: height / 2 - 10, width: 20, height: 20 }, 180, 270);
    return p;
  }, [width, height]);
  
  const arrowPath = useMemo(() => {
    const p = Skia.Path.Make();
    const cx = width / 2;
    const cy = height / 2;
    if (direction === 'clockwise') {
      p.moveTo(cx + 8, cy - 4);
      p.lineTo(cx + 10, cy);
      p.lineTo(cx + 6, cy);
    } else {
      p.moveTo(cx + 8, cy + 4);
      p.lineTo(cx + 10, cy);
      p.lineTo(cx + 6, cy);
    }
    return p;
  }, [direction, width, height]);
  
  return (
    <View style={styles.momentContainer}>
      <Canvas style={{ width, height }}>
        <Group>
          <Path
            path={arcPath}
            color={color}
            style="stroke"
            strokeWidth={2}
          />
          <Path
            path={arrowPath}
            color={color}
            style="stroke"
            strokeWidth={2}
          />
        </Group>
      </Canvas>
      {label && (
        <Text style={[styles.momentLabel, { color: labelColor as string }]}>
          {label}
        </Text>
      )}
    </View>
  );
};

export const TriangularLoadIcon: React.FC<{ 
  size?: number;
  width?: number;
  height?: number;
  label?: string;
  color?: Color;
  labelColor?: Color;
}> = ({ 
  size = 20, 
  width = 60,
  height = 30,
  label,
  color = '#FFB000',
  labelColor = '#FFB000'
}) => {
  const trianglePath = useMemo(() => {
    const p = Skia.Path.Make();
    p.moveTo(0, height);
    p.lineTo(width * 0.8, 0);
    p.lineTo(width, height);
    p.close();
    return p;
  }, [width, height]);
  
  return (
    <View style={styles.triangularContainer}>
      <Canvas style={{ width, height }}>
        <Path
          path={trianglePath}
          color={color}
          style="stroke"
          strokeWidth={1.5}
        />
      </Canvas>
      {label && (
        <Text style={[styles.triangularLabel, { color: labelColor as string }]}>
          △ {label}
        </Text>
      )}
    </View>
  );
};

// ============================================================================
// MAIN ICON COMPONENT (Tüm ikonları tek bileşende)
// ============================================================================

export const SupportIcon: React.FC<{ 
  type: 'pinned' | 'roller' | 'fixed';
  size?: number;
  color?: Color;
}> = ({ type, size = 20, color = '#FFB000' }) => {
  switch (type) {
    case 'pinned':
      return <PinnedSupportIcon width={size} height={size} color={color} />;
    case 'roller':
      return <RollerSupportIcon width={size} height={size} color={color} />;
    case 'fixed':
      return <FixedSupportIcon width={size} height={size} color={color} />;
    default:
      return null;
  }
};

export const LoadIcon: React.FC<{ 
  type: 'point' | 'udl' | 'moment' | 'triangular';
  direction?: 'down' | 'up';
  magnitude?: number;
  width?: number;
  height?: number;
  label?: string;
  color?: Color;
  labelColor?: Color;
}> = ({ 
  type, 
  direction = 'down', 
  magnitude, 
  width, 
  height,
  label,
  color = '#FFB000',
  labelColor = '#FFB000'
}) => {
  switch (type) {
    case 'point':
      return (
        <PointLoadIcon 
          direction={direction} 
          width={width || 20}
          height={height || 20}
          magnitude={magnitude}
          color={color}
          labelColor={labelColor}
        />
      );
    case 'udl':
      return (
        <UDLIcon 
          direction={direction}
          width={width || 100}
          height={height || 24}
          label={label}
          color={color}
          labelColor={labelColor}
        />
      );
    case 'moment':
      return (
        <MomentIcon 
          direction={direction === 'down' ? 'clockwise' : 'counterclockwise'}
          width={width || 30}
          height={height || 30}
          magnitude={magnitude}
          color={color}
          labelColor={labelColor}
        />
      );
    case 'triangular':
      return (
        <TriangularLoadIcon
          width={width || 60}
          height={height || 30}
          label={label}
          color={color}
          labelColor={labelColor}
        />
      );
    default:
      return null;
  }
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointLoadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointLoadLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#FFB000',
    marginTop: 2,
    fontWeight: 'bold',
  },
  udlContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  udlLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#FFB000',
    marginTop: 2,
    fontWeight: 'bold',
  },
  momentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  momentLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#FFB000',
    marginTop: 2,
    fontWeight: 'bold',
  },
  triangularContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  triangularLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#FFB000',
    marginTop: 2,
    fontWeight: 'bold',
  },
});
