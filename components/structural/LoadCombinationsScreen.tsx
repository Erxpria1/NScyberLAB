// ============================================================================
// LOAD COMBINATIONS SCREEN - Yük Kombinasyonları Ekranı
// TS 498 Yük Kombinasyonları
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Colors, Typography, Spacing, Shapes } from '@/utils/theme';
import {
  STANDARD_COMBINATIONS,
  calculateCombination,
  calculateAllCombinations,
  getUltimateCombinations,
  getServiceabilityCombinations,
  LOAD_TYPE_NAMES,
  LIVE_LOADS_TS498,
  type LoadCombination,
  type CombinationResult,
} from '@/utils/structural/loadCombinations';

// ============================================================================
// TYPES
// ============================================================================

interface LoadCombinationsScreenProps {
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

const LoadInputRow: React.FC<{
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  unit: string;
  placeholder?: string;
}> = ({ label, value, onChangeText, unit, placeholder }) => (
  <View style={styles.inputRow}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      keyboardType="numeric"
      placeholder={placeholder}
      placeholderTextColor={Colors.gray[600]}
    />
    <Text style={styles.inputUnit}>{unit}</Text>
  </View>
);

const CombinationCard: React.FC<{
  combination: LoadCombination;
  result?: CombinationResult;
  onPress: () => void;
}> = ({ combination, result, onPress }) => (
  <TouchableOpacity style={styles.comboCard} onPress={onPress}>
    <View style={styles.comboHeader}>
      <Text style={styles.comboFormula}>{combination.formula}</Text>
      <View style={[
        styles.comboType,
        combination.isUltimate ? styles.comboUltimate : styles.comboService,
      ]}>
        <Text style={styles.comboTypeText}>
          {combination.isUltimate ? 'GK' : 'DK'}
        </Text>
      </View>
    </View>
    <Text style={styles.comboDesc}>{combination.description}</Text>
    {result && (
      <View style={styles.comboResult}>
        <Text style={styles.comboResultLabel}>Sonuç:</Text>
        <Text style={styles.comboResultValue}>
          {result.value.toFixed(2)} kN
        </Text>
      </View>
    )}
  </TouchableOpacity>
);

// ============================================================================
// MAIN SCREEN
// ============================================================================

export const LoadCombinationsScreen: React.FC<LoadCombinationsScreenProps> = ({ onBack }) => {
  const [selectedTab, setSelectedTab] = useState<'loads' | 'combinations' | 'presets'>('loads');
  const [loadValues, setLoadValues] = useState<Record<string, string>>({
    G: '10',    // Ölü yük
    Q: '5',     // Hareketli yük
    W: '2',     // Rüzgar
    S: '1.5',   // Kar
  });

  const [results, setResults] = useState<CombinationResult[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('office');

  const presetNames: Record<string, string> = {
    office: 'OFİS',
    housing: 'KONUT',
    cinema: 'SİNEMA/SALON',
    garage: 'GARAJ',
  };

  const presetValues: Record<string, Partial<Record<string, string>>> = {
    office: { G: '8', Q: '2.0', W: '1.0' },
    housing: { G: '6', Q: '1.5', W: '0.8' },
    cinema: { G: '8', Q: '4.0', W: '1.0' },
    garage: { G: '10', Q: '2.5', W: '1.0' },
  };

  const handleCalculate = () => {
    const loads: Record<string, number> = {};
    for (const [key, value] of Object.entries(loadValues)) {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        loads[key] = num;
      }
    }
    const calculatedResults = calculateAllCombinations(loads);
    setResults(calculatedResults);
    setSelectedTab('combinations');
  };

  const handlePresetSelect = (preset: string) => {
    setSelectedPreset(preset);
    const values = presetValues[preset];
    if (values) {
      setLoadValues(prev => ({ ...prev, ...values }));
    }
  };

  const renderLoadsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>[ YÜK DEĞERLERİ ]</Text>

      {/* Preset Selector */}
      <View style={styles.presetContainer}>
        <Text style={styles.presetLabel}>HIZLI SEÇİM:</Text>
        <View style={styles.presetButtons}>
          {(Object.keys(presetNames) as string[]).map(preset => (
            <TouchableOpacity
              key={preset}
              style={[
                styles.presetButton,
                selectedPreset === preset && styles.presetButtonSelected,
              ]}
              onPress={() => handlePresetSelect(preset)}
            >
              <Text style={styles.presetButtonText}>{presetNames[preset]}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Load Inputs */}
      <View style={styles.inputsContainer}>
        <Text style={styles.inputSectionTitle}>Yük Değerleri (kN/m²):</Text>

        <LoadInputRow
          label={LOAD_TYPE_NAMES.dead.symbol}
          value={loadValues.G}
          onChangeText={(text) => setLoadValues({ ...loadValues, G: text })}
          unit="kN/m²"
          placeholder="10"
        />
        <Text style={styles.inputHint}>{LOAD_TYPE_NAMES.dead.description}</Text>

        <LoadInputRow
          label={LOAD_TYPE_NAMES.live.symbol}
          value={loadValues.Q}
          onChangeText={(text) => setLoadValues({ ...loadValues, Q: text })}
          unit="kN/m²"
          placeholder="5"
        />
        <Text style={styles.inputHint}>{LOAD_TYPE_NAMES.live.description}</Text>

        <LoadInputRow
          label={LOAD_TYPE_NAMES.wind.symbol}
          value={loadValues.W}
          onChangeText={(text) => setLoadValues({ ...loadValues, W: text })}
          unit="kN/m²"
          placeholder="2"
        />
        <Text style={styles.inputHint}>{LOAD_TYPE_NAMES.wind.description}</Text>

        <LoadInputRow
          label={LOAD_TYPE_NAMES.snow.symbol}
          value={loadValues.S}
          onChangeText={(text) => setLoadValues({ ...loadValues, S: text })}
          unit="kN/m²"
          placeholder="1.5"
        />
        <Text style={styles.inputHint}>{LOAD_TYPE_NAMES.snow.description}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <RetroButton label="KOMBİNASYON HESAPLA" onPress={handleCalculate} />
      </View>
    </View>
  );

  const renderCombinationsTab = () => {
    const combinations = results.length > 0 ? STANDARD_COMBINATIONS : STANDARD_COMBINATIONS;

    return (
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>
          [ YÜK KOMBİNASYONLARI - TS 498 ]
        </Text>

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: Colors.retro.primary }]} />
            <Text style={styles.legendText}>GK (Güvenlik Katsayılı)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: Colors.retro.secondary }]} />
            <Text style={styles.legendText}>DK (Durum Katsayılı)</Text>
          </View>
        </View>

        {results.length > 0 ? (
          <>
            {combinations.map(combo => {
              const result = results.find(r => r.id === combo.id);
              return (
                <CombinationCard
                  key={combo.id}
                  combination={combo}
                  result={result}
                  onPress={() => {}}
                />
              );
            })}

            {/* Critical Combination */}
            <View style={styles.criticalBox}>
              <Text style={styles.criticalTitle}>EN KRİTİK KOMBİNASYON</Text>
              {(() => {
                const maxResult = results.reduce((max, r) =>
                  r.value > max.value ? r : max, results[0]
                );
                const combo = combinations.find(c => c.id === maxResult.id);
                return combo ? (
                  <Text style={styles.criticalValue}>
                    {combo.formula} → {maxResult.value.toFixed(2)} kN
                  </Text>
                ) : null;
              })()}
            </View>
          </>
        ) : (
          <Text style={styles.noResults}>Önce yük değerleri girip hesaplama yapın</Text>
        )}
      </View>
    );
  };

  const renderPresetsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>[ TS 498 HAREKETLİ YÜKLER ]</Text>

      {Object.entries(LIVE_LOADS_TS498).map(([key, value]) => (
        <View key={key} style={styles.presetValueCard}>
          <View style={styles.presetValueHeader}>
            <Text style={styles.presetValueName}>{value.name}</Text>
          </View>
          <View style={styles.presetValueDetails}>
            <Text style={styles.presetValueNumber}>{value.value} {value.unit}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← GERİ</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>YÜK KOMBİNASYONLARI</Text>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'loads' && styles.tabSelected]}
          onPress={() => setSelectedTab('loads')}
        >
          <Text style={[styles.tabText, selectedTab === 'loads' && styles.tabTextSelected]}>
            YÜKLER
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'combinations' && styles.tabSelected]}
          onPress={() => setSelectedTab('combinations')}
        >
          <Text style={[styles.tabText, selectedTab === 'combinations' && styles.tabTextSelected]}>
            KOMBİNASYONLAR
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'presets' && styles.tabSelected]}
          onPress={() => setSelectedTab('presets')}
        >
          <Text style={[styles.tabText, selectedTab === 'presets' && styles.tabTextSelected]}>
            TS 498
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'loads' && renderLoadsTab()}
        {selectedTab === 'combinations' && renderCombinationsTab()}
        {selectedTab === 'presets' && renderPresetsTab()}
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
    fontSize: Typography.sizes.sm,
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
    fontSize: 10,
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
  tabContent: {
    paddingBottom: Spacing.lg,
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
  presetContainer: {
    backgroundColor: Colors.ide.toolWindow,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  presetLabel: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.gray[600],
    marginBottom: Spacing.xs,
  },
  presetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  presetButton: {
    backgroundColor: Colors.gray[700],
    borderWidth: 1,
    borderColor: Colors.black,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  presetButtonSelected: {
    backgroundColor: Colors.amber.secondary,
  },
  presetButtonText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.black,
    fontWeight: 'bold',
  },
  inputsContainer: {
    backgroundColor: Colors.ide.toolWindow,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  inputSectionTitle: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.amber.secondary,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[700],
  },
  inputLabel: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    width: 40,
  },
  input: {
    flex: 1,
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    backgroundColor: Colors.black,
    borderWidth: 1,
    borderColor: Colors.gray[700],
    padding: Spacing.xs,
    textAlign: 'right',
  },
  inputUnit: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.gray[600],
    width: 60,
    textAlign: 'right',
  },
  inputHint: {
    fontFamily: Typography.family.mono,
    fontSize: 9,
    color: Colors.gray[600],
    fontStyle: 'italic',
    marginBottom: Spacing.xs,
    marginLeft: Spacing.sm,
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
  legendContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: Colors.black,
  },
  legendText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.gray[600],
  },
  comboCard: {
    backgroundColor: Colors.ide.toolWindow,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  comboHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  comboFormula: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    fontWeight: 'bold',
    flex: 1,
  },
  comboType: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.black,
  },
  comboUltimate: {
    backgroundColor: Colors.retro.primary,
  },
  comboService: {
    backgroundColor: Colors.retro.secondary,
  },
  comboTypeText: {
    fontFamily: Typography.family.mono,
    fontSize: 8,
    color: Colors.black,
    fontWeight: '900',
  },
  comboDesc: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.gray[600],
    marginBottom: Spacing.xs,
  },
  comboResult: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.black,
    padding: Spacing.xs,
  },
  comboResultLabel: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.amber.secondary,
  },
  comboResultValue: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    fontWeight: 'bold',
  },
  criticalBox: {
    backgroundColor: Colors.amber.secondary,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
  },
  criticalTitle: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.black,
    fontWeight: '900',
    marginBottom: Spacing.xs,
  },
  criticalValue: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.black,
    fontWeight: 'bold',
  },
  noResults: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.gray[600],
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  presetValueCard: {
    backgroundColor: Colors.ide.toolWindow,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  presetValueHeader: {
    flex: 1,
  },
  presetValueName: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    fontWeight: 'bold',
  },
  presetValueDetails: {
    alignItems: 'flex-end',
  },
  presetValueNumber: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.md,
    color: Colors.amber.secondary,
    fontWeight: 'bold',
  },
});

export default LoadCombinationsScreen;
