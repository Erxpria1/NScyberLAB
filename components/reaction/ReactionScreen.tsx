// ============================================================================
// REACTION CALCULATOR SCREEN - REFACTORED
// Reduced from ~1580 to ~1100 lines using new utilities and components
// ============================================================================

import React, { useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  Text,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReactionStore } from '@/store/useReactionStore';
import {
  RetroCard,
  RetroButton,
  CRTOverlay
} from '@/components/retro';
import { Colors, Typography, Spacing } from '@/utils/theme';
import {
  SupportType,
  LoadType,
  type Load,
  type Support,
} from '@/utils/structural/reactionCalculator';
import { ReactionDiagrams } from './ReactionDiagrams';
import { BeamTypeSelector } from './BeamTypeSelector';
import { KatexRender, EngineeringFormulas } from '@/components/math';
import { parseNumberSafe } from '@/utils/numberUtils';
import { calculateScale, positionToPixel } from '@/utils/structural/positionUtils';
import { formatLoadDescription, LOAD_TYPE_LABELS, getLoadTypeLabel } from '@/utils/structural/loadFactory';
import { ListItemRow, EmptyList } from './ListItemRow';
import { AddSupportModal } from './AddSupportModal';
import { AddLoadModal } from './AddLoadModal';
import {
  PinnedSupportIcon,
  RollerSupportIcon,
  FixedSupportIcon,
  PointLoadIcon,
  UDLIcon,
  MomentIcon,
  TriangularLoadIcon
} from './SVGIcons';

// ============================================================================
// CONSTANTS
// ============================================================================

const SCREEN_WIDTH = 375; // Will be updated by Dimensions
const BEAM_VIEW_HEIGHT = 180;
const BEAM_PADDING = 40;

// ============================================================================
// BEAM VISUALIZATION
// ============================================================================

const BeamVisualization: React.FC = () => {
  const { beamLength, supports, loads } = useReactionStore();

  // Scale: pixels per meter
  const scale = useMemo(() => {
    return calculateScale(beamLength, SCREEN_WIDTH, BEAM_PADDING);
  }, [beamLength]);

  // Position to pixel converter
  const posToPixel = useCallback((pos: number) => {
    return positionToPixel(pos, scale, BEAM_PADDING);
  }, [scale]);

  // Render support symbol
  const renderSupport = useCallback((support: Support, index: number) => {
    const x = posToPixel(support.position);

    return (
      <View key={`support-${index}`} style={[styles.supportSymbol, { left: x - 15 }]}>
        {support.type === SupportType.PINNED && (
          <PinnedSupportIcon size={20} color={Colors.amber.primary} />
        )}
        {support.type === SupportType.ROLLER && (
          <RollerSupportIcon size={20} color={Colors.amber.primary} />
        )}
        {support.type === SupportType.FIXED && (
          <FixedSupportIcon size={20} color={Colors.amber.primary} />
        )}
        <Text style={styles.supportLabel}>{index + 1}</Text>
      </View>
    );
  }, [posToPixel]);

  // Render load symbols
  const renderLoads = useCallback(() => {
    return loads.map((load, index) => {
      if (load.type === LoadType.POINT) {
        const x = posToPixel(load.position);
        const label = `${Math.abs(load.magnitude).toFixed(1)}kN`;
        return (
          <View key={`load-${index}`} style={[styles.loadPoint, { left: x - 10 }]}>
            <PointLoadIcon
              direction={load.magnitude >= 0 ? 'down' : 'up'}
              size={24}
              color={Colors.amber.primary}
              magnitude={load.magnitude}
            />
            <Text style={styles.loadLabelSmall}>{label}</Text>
          </View>
        );
      } else if (load.type === LoadType.UDL) {
        const startX = posToPixel(load.startPosition);
        const endX = posToPixel(load.endPosition);
        const width = endX - startX;
        const label = `${Math.abs(load.magnitude).toFixed(1)}kN/m`;
        return (
          <View key={`load-${index}`} style={[styles.loadUDL, { left: startX, width }]}>
            <UDLIcon
              direction={load.magnitude >= 0 ? 'down' : 'up'}
              size={20}
              color={Colors.amber.primary}
              label={label}
            />
          </View>
        );
      } else if (load.type === LoadType.MOMENT) {
        const x = posToPixel(load.position);
        const label = `${load.magnitude.toFixed(1)}kNm`;
        return (
          <View key={`load-${index}`} style={[styles.loadMoment, { left: x - 10 }]}>
            <MomentIcon
              direction={load.magnitude >= 0 ? 'clockwise' : 'counterclockwise'}
              size={24}
              color={Colors.amber.primary}
              magnitude={load.magnitude}
            />
            <Text style={styles.loadLabelSmall}>{label}</Text>
          </View>
        );
      } else if (load.type === LoadType.TRIANGULAR) {
        const startX = posToPixel(load.startPosition);
        const endX = posToPixel(load.endPosition);
        const width = endX - startX;
        const label = `${Math.abs(load.maxMagnitude).toFixed(1)}`;
        return (
          <View key={`load-${index}`} style={[styles.loadTriangular, { left: startX, width }]}>
            <TriangularLoadIcon
              size={20}
              color={Colors.amber.primary}
              label={label}
            />
          </View>
        );
      }
      return null;
    });
  }, [loads, posToPixel]);

  return (
    <RetroCard style={styles.beamVisualizationCard}>
      <Text style={styles.retroSectionTitle}>KİRİŞ ŞEMASI [V3.1]</Text>
      <View style={styles.beamCanvas}>
        {/* Physical Pixel-Art Beam */}
        <View style={styles.pixelBeamContainer}>
          <View style={styles.pixelBeamBody} />
          <View style={styles.pixelBeamHighlight} />
        </View>

        {/* Dimension line */}
        <View style={styles.dimensionLine}>
          <View style={styles.dimensionTickLeft} />
          <View style={styles.dimensionBar} />
          <View style={styles.dimensionTickRight} />
          <Text style={styles.dimensionText}>{beamLength.toFixed(1)}m</Text>
        </View>

        {/* Supports */}
        {supports.map((s, i) => renderSupport(s, i))}

        {/* Loads */}
        {renderLoads()}
      </View>
    </RetroCard>
  );
};

// ============================================================================
// BEAM CONFIGURATION
// ============================================================================

const BeamConfig: React.FC = () => {
  const { beamLength, setBeamLength } = useReactionStore();
  const [lengthInput, setLengthInput] = React.useState(beamLength.toString());

  React.useEffect(() => {
    setLengthInput(beamLength.toString());
  }, [beamLength]);

  const handleLengthChange = (text: string) => {
    setLengthInput(text);
    const val = parseNumberSafe(text);
    if (val > 0) {
      setBeamLength(val);
    }
  };

  return (
    <RetroCard style={styles.section}>
      <Text style={styles.retroSectionTitle}>KİRİŞ ÖZELLİKLERİ</Text>
      <Text style={styles.modalLabel}>TOPLAM UZUNLUK (m):</Text>
      <TextInput
        style={styles.retroInput}
        value={lengthInput}
        onChangeText={handleLengthChange}
        keyboardType="decimal-pad"
        placeholder="6.0"
        placeholderTextColor={Colors.retro.gray}
      />
    </RetroCard>
  );
};

// ============================================================================
// SUPPORT MANAGER
// ============================================================================

const SupportManager: React.FC = () => {
  const { supports, removeSupport } = useReactionStore();
  const [showAddModal, setShowAddModal] = React.useState(false);

  const getSupportLabel = (support: Support): string => {
    switch (support.type) {
      case SupportType.FIXED:
        return 'SABİT MESNET';
      case SupportType.PINNED:
        return 'MAFSALLI MESNET';
      case SupportType.ROLLER:
        return 'HAREKETLİ MESNET';
      default:
        return 'MESNET';
    }
  };

  return (
    <RetroCard style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.retroSectionTitle}>MESNET NOKTALARI</Text>
        <RetroButton
          label="MESNET EKLE"
          onPress={() => setShowAddModal(true)}
          color={Colors.retro.primary}
          style={styles.retroAddBtn}
          labelStyle={{ fontSize: 10, fontWeight: '900' }}
        />
      </View>

      <View style={styles.itemList}>
        {supports.map((support, index) => (
          <ListItemRow
            key={index}
            title={getSupportLabel(support)}
            subtitle={`X-POS = ${support.position.toFixed(2)}m`}
            onRemove={() => removeSupport(index)}
          />
        ))}
        {supports.length === 0 && (
          <EmptyList message="Mesnet ekleyin veya preset seçin" />
        )}
      </View>

      <AddSupportModal visible={showAddModal} onClose={() => setShowAddModal(false)} />
    </RetroCard>
  );
};

// ============================================================================
// LOAD MANAGER
// ============================================================================

const LoadManager: React.FC = () => {
  const { loads, removeLoad } = useReactionStore();
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [loadType, setLoadType] = React.useState<LoadType>(LoadType.POINT);

  // Reset load type when modal closes
  const handleClose = () => {
    setShowAddModal(false);
    setLoadType(LoadType.POINT);
  };

  return (
    <RetroCard style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.retroSectionTitle}>YÜK YAPILANDIRMASI</Text>
        <RetroButton
          label="YÜK EKLE"
          onPress={() => setShowAddModal(true)}
          color={Colors.retro.primary}
          style={styles.retroAddBtn}
          labelStyle={{ fontSize: 10, fontWeight: '900' }}
        />
      </View>

      <View style={styles.itemList}>
        {loads.map((load, index) => (
          <ListItemRow
            key={index}
            title={getLoadTypeLabel(load.type)}
            subtitle={formatLoadDescription(load)}
            onRemove={() => removeLoad(index)}
          />
        ))}
        {loads.length === 0 && (
          <EmptyList message="Mesnet veya yük tanımlayın" />
        )}
      </View>

      <AddLoadModal
        visible={showAddModal}
        loadType={loadType}
        onLoadTypeChange={setLoadType}
        onClose={handleClose}
      />
    </RetroCard>
  );
};

// ============================================================================
// RESULTS SCREEN
// ============================================================================

const ResultsScreen: React.FC = () => {
  const { results, setShowResults, beamLength, supports, loads } = useReactionStore();
  const insets = useSafeAreaInsets();

  if (!results || !results.isValid) {
    return (
      <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <RetroCard style={styles.errorContainer}>
          <Text style={styles.errorTitle}>HESAPLAMA BAŞARISIZ</Text>
          <Text style={styles.errorMessage}>{results?.errorMessage || 'Bilinmeyen hata'}</Text>
          <RetroButton
            label="GERİ DÖN"
            onPress={() => setShowResults(false)}
            color={Colors.retro.gray}
          />
        </RetroCard>
      </SafeAreaView>
    );
  }

  const getSupportTypeLabel = (idx: number): string => {
    const support = supports[idx];
    if (!support) return '';
    if (support.type === SupportType.FIXED) return 'SABİT';
    if (support.type === SupportType.PINNED) return 'MAFSALLI';
    if (support.type === SupportType.ROLLER) return 'DÖNER';
    return '';
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>HESAP SONUÇLARI</Text>
        <RetroButton
          label="✕"
          onPress={() => setShowResults(false)}
          color={Colors.retro.primary}
          style={styles.closeResultsButton}
          labelStyle={styles.closeResultsText}
        />
      </View>
      <ScrollView
        style={styles.resultsScrollView}
        contentContainerStyle={[styles.resultsScrollContent, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >

      {/* System Summary */}
      <View style={styles.resultSection}>
        <Text style={styles.resultSectionTitle}>SİSTEM ÖZETİ</Text>
        <View style={styles.resultValues}>
          <Text style={styles.resultValue}>Kiriş Uzunluğu: L = {beamLength.toFixed(1)} m</Text>
          <Text style={styles.resultValue}>Mesnet Sayısı: {supports.length}</Text>
          <Text style={styles.resultValue}>Yük Sayısı: {loads.length}</Text>
        </View>
      </View>

      {/* Reactions */}
      <View style={styles.resultSection}>
        <Text style={styles.resultSectionTitle}>REAKSİYONLAR</Text>
        {Array.from(results.reactions.entries()).map(([idx, r]) => (
          <View key={idx} style={styles.resultItem}>
            <Text style={styles.resultLabel}>
              Mesnet #{Number(idx) + 1} ({getSupportTypeLabel(Number(idx))}) - x = {supports[Number(idx)]?.position.toFixed(1)}m
            </Text>
            <View style={styles.resultValues}>
              <Text style={styles.resultValue}>R_x = {r.horizontal.toFixed(2)} kN</Text>
              <Text style={[styles.resultValue, r.vertical >= 0 && styles.resultValuePos]}>
                R_y = {r.vertical.toFixed(2)} kN {r.vertical >= 0 ? '↑' : '↓'}
              </Text>
              {Math.abs(r.moment) > 0.01 && (
                <Text style={styles.resultValue}>M = {r.moment.toFixed(2)} kNm</Text>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Max Values */}
      <View style={styles.resultSection}>
        <Text style={styles.resultSectionTitle}>EKSTREMUM DEĞERLER</Text>
        <View style={styles.resultValues}>
          <Text style={styles.resultValue}>
            Max Kayma: V_max = {Math.abs(results.maxShear.value).toFixed(2)} kN @ x ={' '}
            {results.maxShear.position.toFixed(2)} m
          </Text>
          <Text style={styles.resultValue}>
            Max Moment: M_max = {results.maxMoment.value.toFixed(2)} kNm @ x ={' '}
            {results.maxMoment.position.toFixed(2)} m
          </Text>
          {Math.abs(results.minMoment.value - results.maxMoment.value) > 0.01 && (
            <Text style={styles.resultValue}>
              Min Moment: M_min = {results.minMoment.value.toFixed(2)} kNm @ x ={' '}
              {results.minMoment.position.toFixed(2)} m
            </Text>
          )}
        </View>
      </View>

      {/* Engineering Properties */}
      {results.maxStress && (
        <View style={styles.resultSection}>
          <Text style={styles.resultSectionTitle}>MÜHENDİSLİK DEĞERLER</Text>
          <View style={styles.resultValues}>
            <View style={styles.formulaRow}>
              <View style={styles.formulaLabel}>
                <Text style={styles.resultValue}>Formül:</Text>
              </View>
              <KatexRender
                formula={EngineeringFormulas.stress}
                color={Colors.engineering.stress}
                fontSize={Typography.sizes.sm}
              />
            </View>
            <Text style={styles.resultValue}>
              Max Gerilme: σ_max = {results.maxStress.value.toFixed(2)} {results.maxStress.unit} @ x ={' '}
              {results.maxStress.position.toFixed(2)} m
            </Text>
            {results.deflection && (
              <>
                <View style={styles.formulaRow}>
                  <View style={styles.formulaLabel}>
                    <Text style={styles.resultValue}>Formül:</Text>
                  </View>
                  <KatexRender
                    formula={EngineeringFormulas.deflectionPoint}
                    color={Colors.engineering.deflection}
                    fontSize={Typography.sizes.sm}
                  />
                </View>
                <Text style={styles.resultValue}>
                  Max Sehimleme: δ_max = {Math.abs(results.deflection.value).toFixed(2)} {results.deflection.unit} @ x ={' '}
                  {results.deflection.position.toFixed(2)} m
                </Text>
              </>
            )}
          </View>
        </View>
      )}

      {/* Diagrams */}
      <ReactionDiagrams results={results} />
    </ScrollView>
    </SafeAreaView>
  );
};

// ============================================================================
// MAIN SCREEN
// ============================================================================

export const ReactionScreen: React.FC = () => {
  const { showResults, calculate, results } = useReactionStore();
  const insets = useSafeAreaInsets();

  if (showResults && results) {
    return <ResultsScreen />;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.container}>
        <CRTOverlay />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + Spacing.xl + 80 }
          ]}
          showsVerticalScrollIndicator={false}
        >
          <BeamTypeSelector />
          <BeamVisualization />
          <BeamConfig />
          <SupportManager />
          <LoadManager />
        </ScrollView>

        {/* Calculate Button */}
        <RetroButton
          label="TEPKİLERİ HESAPLA [BAŞLAT]"
          onPress={calculate}
          color={Colors.retro.accent}
          style={[styles.calculateButton, { bottom: insets.bottom + Spacing.md }]}
          labelStyle={styles.calculateButtonText}
        />
      </View>
    </SafeAreaView>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.retro.bg,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.retro.bg,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'android' ? Spacing.md : Spacing.sm,
  },

  // Retro Components
  retroSectionTitle: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    backgroundColor: Colors.black,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.retro.accent,
  },
  beamVisualizationCard: {
    backgroundColor: Colors.retro.dark,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    minHeight: 200,
    maxHeight: 280,
    padding: Spacing.sm,
    overflow: 'hidden',
  },
  section: {
    padding: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  retroInput: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    backgroundColor: Colors.black,
    borderWidth: 2,
    borderColor: Colors.retro.gray,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
    minHeight: 44,
  },
  modalLabel: {
    fontFamily: Typography.family.mono,
    fontSize: 10,
    color: Colors.retro.text,
    marginTop: Spacing.md,
    marginBottom: 4,
  },

  // Lists
  itemList: {
    marginTop: Spacing.sm,
  },
  retroAddBtn: {
    paddingHorizontal: Spacing.sm,
    minHeight: 44,
  },

  // Beam Visualization
  beamCanvas: {
    height: BEAM_VIEW_HEIGHT,
    position: 'relative',
    marginTop: Spacing.xs,
    overflow: 'hidden',
  },
  pixelBeamContainer: {
    position: 'absolute',
    top: BEAM_VIEW_HEIGHT / 2 - 6,
    left: BEAM_PADDING,
    right: BEAM_PADDING,
    height: 12,
    zIndex: 1,
  },
  pixelBeamBody: {
    flex: 1,
    backgroundColor: Colors.retro.gray,
    borderWidth: 2,
    borderColor: Colors.black,
  },
  pixelBeamHighlight: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dimensionLine: {
    position: 'absolute',
    bottom: 20,
    left: BEAM_PADDING,
    right: BEAM_PADDING,
    height: 20,
  },
  dimensionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.retro.gray,
  },
  dimensionTickLeft: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 2,
    height: 10,
    backgroundColor: Colors.retro.gray,
  },
  dimensionTickRight: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 2,
    height: 10,
    backgroundColor: Colors.retro.gray,
  },
  dimensionText: {
    position: 'absolute',
    bottom: 5,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: Typography.family.mono,
    fontSize: 10,
    color: Colors.retro.text,
  },
  supportSymbol: {
    position: 'absolute',
    bottom: BEAM_VIEW_HEIGHT / 2 - 12,
    alignItems: 'center',
    width: 30,
    zIndex: 2,
  },
  supportLabel: {
    position: 'absolute',
    bottom: -20,
    fontFamily: Typography.family.mono,
    fontSize: 10,
    color: Colors.amber.primary,
    fontWeight: 'bold',
  },
  loadPoint: {
    position: 'absolute',
    top: BEAM_VIEW_HEIGHT / 2 - 50,
    alignItems: 'center',
    width: 40,
  },
  loadLabelSmall: {
    fontFamily: Typography.family.mono,
    fontSize: 9,
    color: Colors.retro.cyan,
    backgroundColor: Colors.black,
    paddingHorizontal: 2,
    marginTop: -2,
  },
  loadUDL: {
    position: 'absolute',
    top: BEAM_VIEW_HEIGHT / 2 - 45,
    height: 35,
    backgroundColor: 'rgba(255, 107, 157, 0.1)',
    borderTopWidth: 2,
    borderTopColor: Colors.amber.secondary,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(0,0,0,0.3)',
  },
  loadMoment: {
    position: 'absolute',
    top: BEAM_VIEW_HEIGHT / 2 - 40,
    alignItems: 'center',
    width: 30,
  },
  loadTriangular: {
    position: 'absolute',
    top: BEAM_VIEW_HEIGHT / 2 - 45,
    height: 35,
    backgroundColor: 'rgba(255, 107, 157, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.amber.secondary,
    overflow: 'hidden',
  },

  // Results
  resultsScrollView: {
    flex: 1,
    backgroundColor: Colors.retro.bg,
  },
  resultsScrollContent: {
    // paddingBottom dinamik olarak insets.bottom ile ayarlanıyor
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.black,
    borderBottomWidth: 2,
    borderBottomColor: Colors.retro.accent,
  },
  resultsTitle: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: 'bold',
  },
  closeResultsButton: {
    width: 36,
    height: 36,
    borderColor: Colors.black,
    backgroundColor: Colors.amber.primary,
  },
  closeResultsText: {
    color: Colors.black,
    fontWeight: 'bold',
    fontSize: 18,
  },
  resultSection: {
    padding: Spacing.md,
    margin: Spacing.md,
    backgroundColor: Colors.retro.dark,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  resultSectionTitle: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.retro.secondary,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
  },
  resultItem: {
    marginBottom: Spacing.md,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  resultLabel: {
    fontFamily: Typography.family.mono,
    fontSize: 10,
    color: Colors.retro.text,
    marginBottom: 4,
  },
  resultValues: {
    marginLeft: Spacing.xs,
  },
  resultValue: {
    fontFamily: Typography.family.mono,
    fontSize: 12,
    color: Colors.white,
    marginBottom: 2,
  },
  resultValuePos: {
    color: Colors.retro.cyan,
  },
  formulaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 8,
  },
  formulaLabel: {
    marginRight: Spacing.sm,
  },

  // Error
  errorContainer: {
    flex: 1,
    backgroundColor: Colors.retro.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorTitle: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.lg,
    color: Colors.retro.primary,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
  },
  errorMessage: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.retro.text,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },

  // Calculate Button
  calculateButton: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    bottom: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.retro.accent,
    borderWidth: 3,
    borderBottomWidth: 6,
    borderRightWidth: 6,
    borderColor: Colors.black,
    borderRadius: 4,
  },
  calculateButtonText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.md,
    color: Colors.black,
    textAlign: 'center',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
