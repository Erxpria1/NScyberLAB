// ============================================================================
// TRUSS ANALYSIS SCREEN - Kafes Sistem Analiz Ekranı
// Method of Joints ile kafes hesabı
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { Colors, Typography, Spacing, Shapes } from '@/utils/theme';
import {
  analyzeTruss,
  TRUSS_PRESETS,
  TRUSS_LABELS,
  getTrussPreset,
  type TrussConfig,
  type TrussResults,
} from '@/utils/structural/trussCalculator';

const { width } = Dimensions.get('window');

// ============================================================================
// TYPES
// ============================================================================

interface TrussAnalysisScreenProps {
  onBack: () => void;
}

// ============================================================================
// COMPONENTS
// ============================================================================

const RetroButton: React.FC<{
  label: string;
  onPress: () => void;
  color?: string;
}> = ({ label, onPress, color = Colors.retro.secondary }) => (
  <TouchableOpacity
    style={[styles.retroButton, { backgroundColor: color, borderColor: Colors.black }]}
    onPress={onPress}
  >
    <Text style={styles.retroButtonText}>{label}</Text>
  </TouchableOpacity>
);

const ResultRow: React.FC<{ label: string; value: string | number; unit?: string }> = ({
  label,
  value,
  unit,
}) => (
  <View style={styles.resultRow}>
    <Text style={styles.resultLabel}>{label}</Text>
    <Text style={styles.resultValue}>
      {typeof value === 'number' ? value.toFixed(2) : value} {unit || ''}
    </Text>
  </View>
);

// ============================================================================
// MAIN SCREEN
// ============================================================================

export const TrussAnalysisScreen: React.FC<TrussAnalysisScreenProps> = ({ onBack }) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('triangular-simple');
  const [results, setResults] = useState<TrussResults | null>(null);
  const [selectedTab, setSelectedTab] = useState<'input' | 'results'>('input');

  const currentConfig = useMemo(() => getTrussPreset(selectedPreset), [selectedPreset]);

  const handleAnalyze = () => {
    if (currentConfig) {
      const analysisResults = analyzeTruss(currentConfig);
      setResults(analysisResults);
      setSelectedTab('results');
    }
  };

  const renderPresetSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>[ KAFES_TİPİ_SEÇİMİ ]</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
        {Object.keys(TRUSS_PRESETS).map(key => (
          <TouchableOpacity
            key={key}
            style={[
              styles.presetCard,
              selectedPreset === key && styles.presetCardSelected,
            ]}
            onPress={() => setSelectedPreset(key)}
          >
            <Text style={styles.presetName}>{TRUSS_LABELS[key]}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderNodeInputs = () => {
    if (!currentConfig) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>[ DÜĞÜMLER ]</Text>
        {currentConfig.nodes.map(node => (
          <View key={node.id} style={styles.nodeCard}>
            <View style={styles.nodeHeader}>
              <Text style={styles.nodeId}>{node.id}</Text>
              <Text style={styles.nodeType}>{node.support ? 'MESNET' : 'SERBEST'}</Text>
            </View>
            <View style={styles.nodeCoords}>
              <Text style={styles.coordText}>X: {node.x.toFixed(1)}m</Text>
              <Text style={styles.coordText}>Y: {node.y.toFixed(1)}m</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderLoadInputs = () => {
    if (!currentConfig) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>[ YÜKLER ]</Text>
        {currentConfig.loads.map((load, idx) => (
          <View key={idx} style={styles.loadCard}>
            <Text style={styles.loadNode}>Düğüm: {load.nodeId}</Text>
            <View style={styles.loadValues}>
              <Text style={styles.loadText}>Fx: {load.fx} kN</Text>
              <Text style={styles.loadText}>Fy: {load.fy} kN</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderResults = () => {
    if (!results) return null;

    if (!results.isValid) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>HATA</Text>
          <Text style={styles.errorMessage}>{results.errorMessage}</Text>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>[ REAKSİYONLAR ]</Text>
        {results.reactions.map(reaction => (
          <View key={reaction.nodeId} style={styles.reactionCard}>
            <Text style={styles.reactionNode}>{reaction.nodeId} Mesnet</Text>
            <View style={styles.reactionValues}>
              <Text style={styles.reactionText}>Rx: {reaction.rx.toFixed(2)} kN</Text>
              <Text style={styles.reactionText}>Ry: {reaction.ry.toFixed(2)} kN</Text>
            </View>
          </View>
        ))}

        <Text style={[styles.sectionTitle, styles.sectionTitleSpacer]}>[ ÇUBUK KUVVETLERİ ]</Text>
        {results.memberForces.map(mf => (
          <View key={mf.memberId} style={styles.memberCard}>
            <Text style={styles.memberId}>Çubuk {mf.memberId}</Text>
            <View style={styles.memberValues}>
              <Text style={[
                styles.memberForce,
                { color: mf.force >= 0 ? Colors.retro.secondary : Colors.retro.primary },
              ]}>
                {mf.force >= 0 ? '+' : ''}{mf.force.toFixed(2)} kN
                {mf.force >= 0 ? ' (ÇEKME)' : ' (BASMA)'}
              </Text>
              <Text style={styles.memberStress}>σ: {mf.stress.toFixed(1)} MPa</Text>
              <Text style={styles.memberStrain}>ε: {mf.strain.toFixed(5)}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← GERİ</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KAFES_ANALİZ</Text>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'input' && styles.tabSelected]}
          onPress={() => setSelectedTab('input')}
        >
          <Text style={[styles.tabText, selectedTab === 'input' && styles.tabTextSelected]}>
            GİRİŞ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'results' && styles.tabSelected]}
          onPress={() => setSelectedTab('results')}
        >
          <Text style={[styles.tabText, selectedTab === 'results' && styles.tabTextSelected]}>
            SONUÇLAR
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'input' ? (
          <>
            {renderPresetSelector()}
            {renderNodeInputs()}
            {renderLoadInputs()}
            <View style={styles.buttonContainer}>
              <RetroButton label="ANALİZ ET" onPress={handleAnalyze} color={Colors.retro.secondary} />
            </View>
          </>
        ) : (
          renderResults()
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ide.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.ide.header,
    borderBottomWidth: Shapes.borderWidth.brutal,
    borderBottomColor: Colors.black,
  },
  backButton: {
    padding: Spacing.sm,
    backgroundColor: Colors.ide.selection,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
    marginRight: Spacing.md,
  },
  backButtonText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.md,
    color: Colors.amber.primary,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.black,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: Colors.gray[600],
  },
  tabSelected: {
    borderBottomColor: Colors.amber.primary,
  },
  tabText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.gray[600],
    fontWeight: 'bold',
  },
  tabTextSelected: {
    color: Colors.amber.primary,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    fontWeight: '900',
    backgroundColor: Colors.black,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    marginBottom: Spacing.sm,
  },
  sectionTitleSpacer: {
    marginTop: Spacing.md,
  },
  presetScroll: {
    flexDirection: 'row',
  },
  presetCard: {
    backgroundColor: Colors.ide.toolWindow,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
    padding: Spacing.sm,
    marginRight: Spacing.sm,
    minWidth: 100,
    alignItems: 'center',
  },
  presetCardSelected: {
    backgroundColor: Colors.amber.secondary,
  },
  presetName: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.black,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  nodeCard: {
    backgroundColor: Colors.ide.toolWindow,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nodeHeader: {
    flex: 1,
  },
  nodeId: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    fontWeight: 'bold',
  },
  nodeType: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.gray[600],
    marginTop: 2,
  },
  nodeCoords: {
    alignItems: 'flex-end',
  },
  coordText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.gray[600],
  },
  loadCard: {
    backgroundColor: Colors.ide.toolWindow,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loadNode: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.secondary,
    fontWeight: 'bold',
  },
  loadValues: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  loadText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.gray[600],
  },
  buttonContainer: {
    marginTop: Spacing.md,
  },
  retroButton: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
    borderWidth: Shapes.borderWidth.brutal,
    borderRadius: 0,
    alignItems: 'center',
    minHeight: 44,
  },
  retroButtonText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.black,
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: Colors.retro.primary,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  errorTitle: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.md,
    color: Colors.black,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
  },
  errorMessage: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.black,
    textAlign: 'center',
  },
  reactionCard: {
    backgroundColor: Colors.ide.toolWindow,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  reactionNode: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.retro.secondary,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  reactionValues: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  reactionText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.gray[600],
  },
  memberCard: {
    backgroundColor: Colors.ide.toolWindow,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  memberId: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.secondary,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  memberValues: {
    gap: 2,
  },
  memberForce: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    fontWeight: 'bold',
  },
  memberStress: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.gray[600],
  },
  memberStrain: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.gray[600],
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[700],
  },
  resultLabel: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.gray[600],
  },
  resultValue: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    fontWeight: 'bold',
  },
});

export default TrussAnalysisScreen;
