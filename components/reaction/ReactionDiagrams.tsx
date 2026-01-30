import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Canvas, Group, Path, Skia } from '@shopify/react-native-skia';
import { Colors, Typography, Spacing } from '@/utils/theme';
import type { AnalysisResults } from '@/utils/structural/reactionCalculator';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// iOS için SafeArea margin'lerini hesaba kat
const SAFE_MARGIN = Spacing.md * 2;
const CHART_WIDTH = Math.min(SCREEN_WIDTH - SAFE_MARGIN, 380); // Maksimum genişlik sınırı
const CHART_HEIGHT = 120;
const PADDING = 30;

interface ReactionDiagramsProps {
  results: AnalysisResults;
}

export const ReactionDiagrams: React.FC<ReactionDiagramsProps> = ({ results }) => {
  const shearData = results.shearDiagram;
  const momentData = results.momentDiagram;

  // Find min/max for scaling
  const allShear = shearData.map((p) => p.shear);
  const allMoment = momentData.map((p) => p.moment);

  const shearMax = Math.max(...allShear.map(Math.abs));
  const momentMax = Math.max(...allMoment.map(Math.abs), 0.1); // Avoid division by zero

  const beamLength = shearData[shearData.length - 1]?.x || 1;

  // Scale functions
  const scaleX = (x: number) => (x / beamLength) * (CHART_WIDTH - 2 * PADDING) + PADDING;
  const scaleY = (
    value: number,
    maxVal: number,
    invert: boolean = false
  ) => {
    const normalized = value / (maxVal * 1.2); // 20% padding
    const y = CHART_HEIGHT / 2 - (normalized * (CHART_HEIGHT / 2 - PADDING));
    return invert ? CHART_HEIGHT - y : y;
  };

  // Generate path data for shear diagram
  const generateShearPath = () => {
    const path = Skia.Path.Make();
    shearData.forEach((point, i) => {
      const x = scaleX(point.x);
      const y = scaleY(point.shear, shearMax, true); // Invert for visual
      if (i === 0) path.moveTo(x, y);
      else path.lineTo(x, y);
    });
    return path;
  };

  // Generate path data for moment diagram
  const generateMomentPath = () => {
    const path = Skia.Path.Make();
    momentData.forEach((point, i) => {
      const x = scaleX(point.x);
      const y = scaleY(point.moment, momentMax, true); // Invert for visual
      if (i === 0) path.moveTo(x, y);
      else path.lineTo(x, y);
    });
    return path;
  };

  // Generate filled area path for shear diagram
  const generateShearAreaPath = (data: typeof shearData, maxVal: number) => {
    const path = Skia.Path.Make();
    data.forEach((point, i) => {
      const x = scaleX(point.x);
      const y = scaleY(point.shear, maxVal, true);
      if (i === 0) {
        path.moveTo(x, CHART_HEIGHT / 2); // Start at zero line
        path.lineTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    });
    // Close path back to zero line
    const lastX = scaleX(data[data.length - 1].x);
    path.lineTo(lastX, CHART_HEIGHT / 2);
    path.close();
    return path;
  };

  // Generate filled area path for moment diagram
  const generateMomentAreaPath = (data: typeof momentData, maxVal: number) => {
    const path = Skia.Path.Make();
    data.forEach((point, i) => {
      const x = scaleX(point.x);
      const y = scaleY(point.moment, maxVal, true);
      if (i === 0) {
        path.moveTo(x, CHART_HEIGHT / 2); // Start at zero line
        path.lineTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    });
    // Close path back to zero line
    const lastX = scaleX(data[data.length - 1].x);
    path.lineTo(lastX, CHART_HEIGHT / 2);
    path.close();
    return path;
  };

  const shearPath = generateShearPath();
  const momentPath = generateMomentPath();
  const shearArea = generateShearAreaPath(shearData, shearMax);

  // Generate zero line path
  const zeroLinePath = () => {
    const path = Skia.Path.Make();
    path.moveTo(PADDING, CHART_HEIGHT / 2);
    path.lineTo(CHART_WIDTH - PADDING, CHART_HEIGHT / 2);
    return path;
  };

  return (
    <View style={styles.diagramsContainer}>
      {/* Shear Force Diagram */}
      <View style={styles.diagramSection}>
        <Text style={styles.diagramTitle}>KAYMA GÜCÜ (V) DİYAGRAMI</Text>
        <View style={styles.chartContainer}>
          <Canvas style={[styles.chart, { height: CHART_HEIGHT }]}>
            {/* Zero line */}
            <Path
              path={zeroLinePath()}
              color={Colors.gray[300]}
              style="stroke"
              strokeWidth={1}
            />

            {/* Shear area fill */}
            <Path path={shearArea} color="rgba(255, 176, 0, 0.2)" />

            {/* Shear line */}
            <Path path={shearPath} color={Colors.engineering.shear} style="stroke" strokeWidth={2} />
          </Canvas>

          {/* Y-axis labels */}
          <View style={styles.yAxisLabels}>
            <Text style={styles.axisLabel}>
              {`+${shearMax.toFixed(1)}`}
            </Text>
            <Text style={styles.axisLabel}>0</Text>
            <Text style={styles.axisLabel}>
              {(-shearMax).toFixed(1)}
            </Text>
          </View>
        </View>
        <Text style={styles.diagramNote}>
          Max: {Math.abs(results.maxShear.value).toFixed(2)} kN @ x ={' '}
          {results.maxShear.position.toFixed(2)} m
        </Text>
      </View>

      {/* Bending Moment Diagram */}
      <View style={styles.diagramSection}>
        <Text style={styles.diagramTitle}>EĞİLME MOMENTİ (M) DİYAGRAMI</Text>
        <View style={styles.chartContainer}>
          <Canvas style={[styles.chart, { height: CHART_HEIGHT }]}>
            {/* Zero line */}
            <Path
              path={zeroLinePath()}
              color={Colors.gray[300]}
              style="stroke"
              strokeWidth={1}
            />

            {/* Moment line */}
            <Path
              path={momentPath}
              color={Colors.engineering.moment}
              style="stroke"
              strokeWidth={2}
            />
          </Canvas>

          {/* Y-axis labels */}
          <View style={styles.yAxisLabels}>
            <Text style={styles.axisLabel}>
              {`+${momentMax.toFixed(1)}`}
            </Text>
            <Text style={styles.axisLabel}>0</Text>
            <Text style={styles.axisLabel}>
              {(-momentMax).toFixed(1)}
            </Text>
          </View>
        </View>
        <Text style={styles.diagramNote}>
          Max: {results.maxMoment.value.toFixed(2)} kNm | Min:{' '}
          {results.minMoment.value.toFixed(2)} kNm
        </Text>
      </View>

      {/* X-axis (Beam) */}
      <View style={styles.beamAxis}>
        <View style={styles.beamLine} />
        {shearData
          .filter((_, i) => i % 10 === 0)
          .map((point) => (
            <View
              key={point.x}
              style={[
                styles.tickMark,
                { left: (point.x / beamLength) * (CHART_WIDTH - 2 * PADDING) + PADDING },
              ]}
            >
              <Text style={styles.tickLabel}>{point.x.toFixed(1)}</Text>
            </View>
          ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  diagramsContainer: {
    padding: Spacing.md,
  },
  diagramSection: {
    marginBottom: Spacing.lg,
  },
  diagramTitle: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.engineering.shear,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chartContainer: {
    position: 'relative',
  },
  chart: {
    width: CHART_WIDTH,
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.amber.dim,
  },
  yAxisLabels: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  axisLabel: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.gray[300],
  },
  diagramNote: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.gray[300],
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  beamAxis: {
    position: 'relative',
    height: 30,
    marginTop: Spacing.sm,
  },
  beamLine: {
    position: 'absolute',
    bottom: 0,
    left: PADDING,
    right: PADDING,
    height: 2,
    backgroundColor: Colors.amber.primary,
  },
  tickMark: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    transform: [{ translateX: -15 }],
  },
  tickLabel: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.gray[300],
  },
});

