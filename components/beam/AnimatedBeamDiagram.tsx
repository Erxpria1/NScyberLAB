import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Canvas, Path, Skia, Circle, Line, vec } from '@shopify/react-native-skia';
import { Colors, Typography, Spacing } from '@/utils/theme';
import type { BeamVisualConfig, VisualSupport, VisualLoad } from '@/types/education';

interface AnimatedBeamDiagramProps {
  config: BeamVisualConfig;
}

const DIAGRAM_HEIGHT = 180;
const PADDING = 40;
const BEAM_Y = 100;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DIAGRAM_WIDTH = SCREEN_WIDTH - Spacing.md * 2;
const BEAM_START_X = PADDING;
const BEAM_END_X = DIAGRAM_WIDTH - PADDING;
const BEAM_LENGTH_PX = BEAM_END_X - BEAM_START_X;

export const AnimatedBeamDiagram: React.FC<AnimatedBeamDiagramProps> = ({ config }) => {
  const scale = BEAM_LENGTH_PX / config.length;
  
  const posToX = (pos: number) => BEAM_START_X + pos * scale;
  
  // Create beam path
  const beamPath = Skia.Path.Make();
  beamPath.moveTo(BEAM_START_X, BEAM_Y);
  beamPath.lineTo(BEAM_END_X, BEAM_Y);
  
  // Render support symbol
  const renderSupport = (support: VisualSupport, index: number) => {
    const x = posToX(support.position);
    const y = BEAM_Y;
    
    switch (support.type) {
      case 'pin': {
        // Triangle for pin support
        const trianglePath = Skia.Path.Make();
        trianglePath.moveTo(x, y);
        trianglePath.lineTo(x - 12, y + 20);
        trianglePath.lineTo(x + 12, y + 20);
        trianglePath.close();
        
        return (
          <React.Fragment key={`support-${index}`}>
            <Path
              path={trianglePath}
              color={Colors.amber.primary}
              style="stroke"
              strokeWidth={2}
            />
            {/* Ground line */}
            <Line
              p1={vec(x - 15, y + 22)}
              p2={vec(x + 15, y + 22)}
              color={Colors.amber.dim}
              style="stroke"
              strokeWidth={2}
            />
          </React.Fragment>
        );
      }
      
      case 'roller': {
        // Triangle with circle for roller
        const trianglePath = Skia.Path.Make();
        trianglePath.moveTo(x, y);
        trianglePath.lineTo(x - 10, y + 16);
        trianglePath.lineTo(x + 10, y + 16);
        trianglePath.close();
        
        return (
          <React.Fragment key={`support-${index}`}>
            <Path
              path={trianglePath}
              color={Colors.amber.primary}
              style="stroke"
              strokeWidth={2}
            />
            <Circle
              cx={x}
              cy={y + 22}
              r={5}
              color={Colors.amber.primary}
              style="stroke"
              strokeWidth={2}
            />
            {/* Ground line */}
            <Line
              p1={vec(x - 15, y + 30)}
              p2={vec(x + 15, y + 30)}
              color={Colors.amber.dim}
              style="stroke"
              strokeWidth={2}
            />
          </React.Fragment>
        );
      }
      
      case 'fixed': {
        // Fixed support (wall pattern)
        const wallPath = Skia.Path.Make();
        wallPath.moveTo(x, y - 20);
        wallPath.lineTo(x, y + 20);
        
        // Hatch lines
        const hatches: React.ReactElement[] = [];
        for (let i = -15; i <= 15; i += 6) {
          hatches.push(
            <Line
              key={`hatch-${index}-${i}`}
              p1={vec(x - 10, y + i)}
              p2={vec(x, y + i + 5)}
              color={Colors.amber.dim}
              style="stroke"
              strokeWidth={1.5}
            />
          );
        }
        
        return (
          <React.Fragment key={`support-${index}`}>
            <Path
              path={wallPath}
              color={Colors.amber.primary}
              style="stroke"
              strokeWidth={3}
            />
            {hatches}
          </React.Fragment>
        );
      }
      
      default:
        return null;
    }
  };
  
  // Render load symbol
  const renderLoad = (load: VisualLoad, index: number) => {
    const x = posToX(load.position);
    const arrowLength = Math.min(40, Math.abs(load.magnitude) * 3);
    
    switch (load.type) {
      case 'point': {
        const arrowPath = Skia.Path.Make();
        arrowPath.moveTo(x, BEAM_Y - arrowLength - 10);
        arrowPath.lineTo(x, BEAM_Y - 5);
        
        // Arrow head
        const arrowHead = Skia.Path.Make();
        arrowHead.moveTo(x - 6, BEAM_Y - 15);
        arrowHead.lineTo(x, BEAM_Y - 5);
        arrowHead.lineTo(x + 6, BEAM_Y - 15);
        
        return (
          <React.Fragment key={`load-${index}`}>
            <Path
              path={arrowPath}
              color={Colors.status.error}
              style="stroke"
              strokeWidth={2}
            />
            <Path
              path={arrowHead}
              color={Colors.status.error}
              style="fill"
            />
          </React.Fragment>
        );
      }
      
      case 'distributed': {
        const endX = posToX(load.endPosition || load.position + 1);
        const arrows: React.ReactElement[] = [];
        const arrowCount = Math.max(3, Math.floor((endX - x) / 20));
        const spacing = (endX - x) / (arrowCount - 1);
        
        for (let i = 0; i < arrowCount; i++) {
          const ax = x + i * spacing;
          arrows.push(
            <Line
              key={`dist-arrow-${index}-${i}`}
              p1={vec(ax, BEAM_Y - 30)}
              p2={vec(ax, BEAM_Y - 5)}
              color={Colors.status.error}
              style="stroke"
              strokeWidth={1.5}
            />
          );
        }
        
        return (
          <React.Fragment key={`load-${index}`}>
            {/* Top line */}
            <Line
              p1={vec(x, BEAM_Y - 30)}
              p2={vec(endX, BEAM_Y - 30)}
              color={Colors.status.error}
              style="stroke"
              strokeWidth={2}
            />
            {arrows}
          </React.Fragment>
        );
      }
      
      case 'moment': {
        // Curved arrow for moment
        const momentPath = Skia.Path.Make();
        momentPath.addArc(
          { x: x - 15, y: BEAM_Y - 25, width: 30, height: 20 },
          0,
          270
        );
        
        return (
          <React.Fragment key={`load-${index}`}>
            <Path
              path={momentPath}
              color={Colors.status.warning}
              style="stroke"
              strokeWidth={2}
            />
          </React.Fragment>
        );
      }
      
      default:
        return null;
    }
  };
  
  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        {/* Beam */}
        <Path
          path={beamPath}
          color={Colors.amber.secondary}
          style="stroke"
          strokeWidth={4}
        />
        
        {/* Supports */}
        {config.supports.map((support, index) => renderSupport(support, index))}
        
        {/* Loads */}
        {config.loads.map((load, index) => renderLoad(load, index))}
      </Canvas>
      
      {/* Labels */}
      <View style={styles.labelsContainer}>
        {config.supports.map((support, index) => (
          <Text
            key={`label-support-${index}`}
            style={[
              styles.label,
              { left: posToX(support.position) - 10, top: BEAM_Y + 35 },
            ]}
          >
            {support.label || ''}
          </Text>
        ))}
        {config.loads.map((load, index) => (
          <Text
            key={`label-load-${index}`}
            style={[
              styles.loadLabel,
              { left: posToX(load.position) - 30, top: BEAM_Y - 55 },
            ]}
          >
            {load.label || `${Math.round(load.magnitude || 0)} kN`}
          </Text>
        ))}
      </View>
      
      {/* Dimension line */}
      <View style={styles.dimensionContainer}>
        <Text style={styles.dimensionText}>L = {config.length} m</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: Colors.amber.dim,
    height: DIAGRAM_HEIGHT + 40,
    marginVertical: Spacing.sm,
  },
  canvas: {
    width: DIAGRAM_WIDTH,
    height: DIAGRAM_HEIGHT,
  },
  labelsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  label: {
    position: 'absolute',
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.primary,
    fontWeight: 'bold',
  },
  loadLabel: {
    position: 'absolute',
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.status.error,
    textAlign: 'center',
    width: 70,
  },
  dimensionContainer: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  dimensionText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.gray[300],
  },
});

export default AnimatedBeamDiagram;
