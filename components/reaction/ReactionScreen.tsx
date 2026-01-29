import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
} from 'react-native';
import { useReactionStore } from '@/store/useReactionStore';
import { Colors, Typography, Spacing } from '@/utils/theme';
import {
  SupportType,
  LoadType,
  type Load,
  type Support,
  PRESET_LABELS,
} from '@/utils/structural/reactionCalculator';
import { ReactionDiagrams } from './ReactionDiagrams';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BEAM_VIEW_HEIGHT = 180;
const BEAM_PADDING = 40;

// ============================================================================
// BEAM VISUALIZATION
// ============================================================================

const BeamVisualization: React.FC = () => {
  const { beamLength, supports, loads } = useReactionStore();

  const scale = (SCREEN_WIDTH - 2 * BEAM_PADDING) / Math.max(beamLength, 1);

  // Render support symbol
  const renderSupport = (support: Support, index: number) => {
    const x = BEAM_PADDING + support.position * scale;
    const y = BEAM_VIEW_HEIGHT / 2;

    return (
      <View key={`support-${index}`} style={[styles.supportSymbol, { left: x - 15 }]}>
        {support.type === SupportType.PINNED && (
          <View style={styles.pinnedSupport}>
            <Text style={styles.supportText}>▲</Text>
          </View>
        )}
        {support.type === SupportType.ROLLER && (
          <View style={styles.rollerSupport}>
            <Text style={styles.supportText}>●</Text>
          </View>
        )}
        {support.type === SupportType.FIXED && (
          <View style={styles.fixedSupport}>
            <Text style={styles.supportText}>■</Text>
          </View>
        )}
        <Text style={styles.supportLabel}>{index + 1}</Text>
      </View>
    );
  };

  // Render load symbols
  const renderLoads = () => {
    return loads.map((load, index) => {
      let x = 0;
      let width = 0;
      let label = '';

      if (load.type === LoadType.POINT) {
        x = load.position * scale;
        width = 2;
        label = `${Math.abs(load.magnitude).toFixed(1)}kN`;
        return (
          <View key={`load-${index}`} style={[styles.loadPoint, { left: BEAM_PADDING + x - 1 }]}>
            <Text style={styles.loadArrow}>↓</Text>
            <Text style={styles.loadLabelSmall}>{label}</Text>
          </View>
        );
      } else if (load.type === LoadType.UDL) {
        const startX = load.startPosition * scale;
        const endX = load.endPosition * scale;
        label = `${Math.abs(load.magnitude).toFixed(1)}kN/m`;
        return (
          <View key={`load-${index}`} style={[styles.loadUDL, { left: BEAM_PADDING + startX, width: endX - startX }]}>
            <Text style={styles.loadLabelSmall}>{label}</Text>
            <View style={styles.udlArrows}>
              <Text style={styles.udlArrow}>↓↓↓</Text>
            </View>
          </View>
        );
      } else if (load.type === LoadType.MOMENT) {
        x = load.position * scale;
        label = `${load.magnitude.toFixed(1)}kNm`;
        return (
          <View key={`load-${index}`} style={[styles.loadMoment, { left: BEAM_PADDING + x - 15 }]}>
            <Text style={styles.loadLabelSmall}>{label}</Text>
            <Text style={styles.momentSymbol}>↻</Text>
          </View>
        );
      } else if (load.type === LoadType.TRIANGULAR) {
        const startX = load.startPosition * scale;
        const endX = load.endPosition * scale;
        label = `△${Math.abs(load.maxMagnitude).toFixed(1)}`;
        return (
          <View key={`load-${index}`} style={[styles.loadTriangular, { left: BEAM_PADDING + startX, width: endX - startX }]}>
            <Text style={styles.loadLabelSmall}>{label}</Text>
          </View>
        );
      }
      return null;
    });
  };

  return (
    <View style={styles.beamVisualization}>
      <Text style={styles.sectionTitle}>KİRİŞ GÖRSELİ</Text>
      <View style={styles.beamCanvas}>
        {/* Beam line */}
        <View style={styles.beamLine} />

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
    </View>
  );
};

// ============================================================================
// PRESET SELECTOR
// ============================================================================

const PresetSelector: React.FC = () => {
  const { loadPreset, selectedPreset } = useReactionStore();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>HAZIR SİSTEMLER</Text>
      <View style={styles.presetGrid}>
        {Object.entries(PRESET_LABELS).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[styles.presetButton, selectedPreset === key && styles.presetButtonActive]}
            onPress={() => loadPreset(key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.presetButtonText,
                selectedPreset === key && styles.presetButtonTextActive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// ============================================================================
// BEAM CONFIGURATION
// ============================================================================

const BeamConfig: React.FC = () => {
  const { beamLength, setBeamLength } = useReactionStore();
  const [lengthInput, setLengthInput] = useState(beamLength.toString());

  // Sync local state with store when preset changes
  useEffect(() => {
    setLengthInput(beamLength.toString());
  }, [beamLength]);

  const handleLengthChange = (text: string) => {
    setLengthInput(text);
    const val = parseFloat(text);
    if (!isNaN(val) && val > 0) {
      setBeamLength(val);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>KİRİŞ UZUNLUĞU (m)</Text>
      <TextInput
        style={styles.numericInput}
        value={lengthInput}
        onChangeText={handleLengthChange}
        keyboardType="decimal-pad"
        placeholder="6.0"
        placeholderTextColor={Colors.amber.dim}
      />
    </View>
  );
};

// ============================================================================
// SUPPORT MANAGER
// ============================================================================

const SupportManager: React.FC = () => {
  const { supports, addSupport, removeSupport, beamLength } = useReactionStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSupportType, setNewSupportType] = useState<SupportType>(SupportType.PINNED);
  const [newSupportPos, setNewSupportPos] = useState('0');

  // Reset input when modal opens
  useEffect(() => {
    if (showAddModal) {
      setNewSupportPos('0');
      setNewSupportType(SupportType.PINNED);
    }
  }, [showAddModal]);

  const handleAddSupport = () => {
    const pos = parseFloat(newSupportPos);
    if (!isNaN(pos) && pos >= 0 && pos <= beamLength) {
      addSupport({ type: newSupportType, position: pos });
      setShowAddModal(false);
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>MESNETLER</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.itemList}>
        {supports.map((support, index) => (
          <View key={index} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemLabel}>
                {support.type === SupportType.FIXED && 'SABİT'}
                {support.type === SupportType.PINNED && 'MAFSALLI'}
                {support.type === SupportType.ROLLER && 'DÖNER'}
              </Text>
              <Text style={styles.itemSublabel}>x = {support.position.toFixed(2)} m</Text>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeSupport(index)}
              activeOpacity={0.7}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        {supports.length === 0 && (
          <Text style={styles.emptyText}>Mesnet ekleyin veya preset seçin</Text>
        )}
      </View>

      {/* Add Support Modal */}
      <Modal visible={showAddModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAddModal(false)}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>MESNET EKLE</Text>

            <Text style={styles.modalLabel}>Tip:</Text>
            <View style={styles.modalOptions}>
              {[
                { type: SupportType.FIXED, label: 'Sabit' },
                { type: SupportType.PINNED, label: 'Mafsallı' },
                { type: SupportType.ROLLER, label: 'Döner' },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.type}
                  style={[
                    styles.modalOption,
                    newSupportType === opt.type && styles.modalOptionActive,
                  ]}
                  onPress={() => setNewSupportType(opt.type)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      newSupportType === opt.type && styles.modalOptionTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Pozisyon (m):</Text>
            <TextInput
              style={styles.modalInput}
              value={newSupportPos}
              onChangeText={setNewSupportPos}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={Colors.amber.dim}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowAddModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonText}>İPTAL</Text>
              </TouchableOpacity>
              <View style={styles.buttonSpacer} />
              <TouchableOpacity
                style={styles.modalButtonOk}
                onPress={handleAddSupport}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonText}>EKLE</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// ============================================================================
// LOAD MANAGER
// ============================================================================

const LoadManager: React.FC = () => {
  const { loads, removeLoad, beamLength } = useReactionStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLoadType, setNewLoadType] = useState<LoadType>(LoadType.POINT);

  // Reset load type when modal opens
  useEffect(() => {
    if (!showAddModal) {
      setNewLoadType(LoadType.POINT);
    }
  }, [showAddModal]);

  const loadTypeLabels: Record<LoadType, string> = {
    [LoadType.POINT]: 'NOKTA YÜKÜ',
    [LoadType.UDL]: 'YAYILI YÜK',
    [LoadType.MOMENT]: 'MOMENT',
    [LoadType.TRIANGULAR]: 'ÜÇGEN YÜK',
  };

  const formatLoad = (load: Load): string => {
    switch (load.type) {
      case LoadType.POINT:
        return `P = ${Math.abs(load.magnitude).toFixed(1)} kN @ x = ${load.position}m`;
      case LoadType.UDL:
        return `w = ${Math.abs(load.magnitude).toFixed(1)} kN/m [${load.startPosition}m - ${load.endPosition}m]`;
      case LoadType.MOMENT:
        return `M = ${load.magnitude.toFixed(1)} kNm @ x = ${load.position}m`;
      case LoadType.TRIANGULAR:
        return `Tri: w_max = ${Math.abs(load.maxMagnitude).toFixed(1)} kN/m [${load.startPosition}m - ${load.endPosition}m]`;
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>YÜKLER</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.itemList}>
        {loads.map((load, index) => (
          <View key={index} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemLabel}>{loadTypeLabels[load.type]}</Text>
              <Text style={styles.itemSublabel}>{formatLoad(load)}</Text>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeLoad(index)}
              activeOpacity={0.7}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        {loads.length === 0 && (
          <Text style={styles.emptyText}>Yük ekleyin veya preset seçin</Text>
        )}
      </View>

      <AddLoadModal
        visible={showAddModal}
        loadType={newLoadType}
        onLoadTypeChange={setNewLoadType}
        onClose={() => setShowAddModal(false)}
      />
    </View>
  );
};

// ============================================================================
// ADD LOAD MODAL
// ============================================================================

interface AddLoadModalProps {
  visible: boolean;
  loadType: LoadType;
  onLoadTypeChange: (type: LoadType) => void;
  onClose: () => void;
}

const AddLoadModal: React.FC<AddLoadModalProps> = ({
  visible,
  loadType,
  onLoadTypeChange,
  onClose,
}) => {
  const { addLoad, beamLength } = useReactionStore();

  // Input states - reset when modal opens
  const [pos, setPos] = useState('3');
  const [mag, setMag] = useState('10');
  const [startPos, setStartPos] = useState('0');
  const [endPos, setEndPos] = useState('6');

  // Reset inputs when modal opens
  useEffect(() => {
    if (visible) {
      setPos('3');
      setMag('10');
      setStartPos('0');
      setEndPos(beamLength.toString());
    }
  }, [visible, beamLength]);

  const handleAdd = () => {
    const posVal = parseFloat(pos);
    const magVal = parseFloat(mag);
    const startVal = parseFloat(startPos);
    const endVal = parseFloat(endPos);

    switch (loadType) {
      case LoadType.POINT:
        if (!isNaN(posVal) && posVal >= 0 && posVal <= beamLength && !isNaN(magVal)) {
          addLoad({
            type: LoadType.POINT,
            position: posVal,
            magnitude: -Math.abs(magVal), // negative = downward
          });
          onClose();
        }
        break;
      case LoadType.UDL:
        if (!isNaN(startVal) && startVal >= 0 && !isNaN(endVal) && endVal <= beamLength && startVal < endVal && !isNaN(magVal)) {
          addLoad({
            type: LoadType.UDL,
            startPosition: startVal,
            endPosition: endVal,
            magnitude: -Math.abs(magVal),
          });
          onClose();
        }
        break;
      case LoadType.MOMENT:
        if (!isNaN(posVal) && posVal >= 0 && posVal <= beamLength && !isNaN(magVal)) {
          addLoad({
            type: LoadType.MOMENT,
            position: posVal,
            magnitude: magVal,
          });
          onClose();
        }
        break;
      case LoadType.TRIANGULAR:
        if (!isNaN(startVal) && startVal >= 0 && !isNaN(endVal) && endVal <= beamLength && startVal < endVal && !isNaN(magVal)) {
          addLoad({
            type: LoadType.TRIANGULAR,
            startPosition: startVal,
            endPosition: endVal,
            maxMagnitude: -Math.abs(magVal),
          });
          onClose();
        }
        break;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.modalContent}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={styles.modalTitle}>YÜK EKLE</Text>

          {/* Load Type Selector */}
          <Text style={styles.modalLabel}>Yük Tipi:</Text>
          <View style={styles.loadTypeSelector}>
            {[
              { type: LoadType.POINT, label: 'Nokta', short: 'P' },
              { type: LoadType.UDL, label: 'Yayılı', short: 'w' },
              { type: LoadType.MOMENT, label: 'Moment', short: 'M' },
              { type: LoadType.TRIANGULAR, label: 'Üçgen', short: '△' },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.type}
                style={[styles.loadTypeButton, loadType === opt.type && styles.loadTypeButtonActive]}
                onPress={() => onLoadTypeChange(opt.type)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.loadTypeButtonText,
                    loadType === opt.type && styles.loadTypeButtonTextActive,
                  ]}
                >
                  {opt.short}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Dynamic Inputs based on load type */}
          {loadType === LoadType.POINT && (
            <>
              <Text style={styles.modalLabel}>Pozisyon (m):</Text>
              <TextInput
                style={styles.modalInput}
                value={pos}
                onChangeText={setPos}
                keyboardType="decimal-pad"
                placeholder="3.00"
                placeholderTextColor={Colors.amber.dim}
              />
              <Text style={styles.modalLabel}>Büyüklük (kN):</Text>
              <TextInput
                style={styles.modalInput}
                value={mag}
                onChangeText={setMag}
                keyboardType="decimal-pad"
                placeholder="10.00"
                placeholderTextColor={Colors.amber.dim}
              />
            </>
          )}

          {loadType === LoadType.UDL && (
            <>
              <Text style={styles.modalLabel}>Başlangıç (m):</Text>
              <TextInput
                style={styles.modalInput}
                value={startPos}
                onChangeText={setStartPos}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={Colors.amber.dim}
              />
              <Text style={styles.modalLabel}>Bitiş (m):</Text>
              <TextInput
                style={styles.modalInput}
                value={endPos}
                onChangeText={setEndPos}
                keyboardType="decimal-pad"
                placeholder="6.00"
                placeholderTextColor={Colors.amber.dim}
              />
              <Text style={styles.modalLabel}>Şiddet (kN/m):</Text>
              <TextInput
                style={styles.modalInput}
                value={mag}
                onChangeText={setMag}
                keyboardType="decimal-pad"
                placeholder="5.00"
                placeholderTextColor={Colors.amber.dim}
              />
            </>
          )}

          {loadType === LoadType.MOMENT && (
            <>
              <Text style={styles.modalLabel}>Pozisyon (m):</Text>
              <TextInput
                style={styles.modalInput}
                value={pos}
                onChangeText={setPos}
                keyboardType="decimal-pad"
                placeholder="3.00"
                placeholderTextColor={Colors.amber.dim}
              />
              <Text style={styles.modalLabel}>Moment (kNm):</Text>
              <TextInput
                style={styles.modalInput}
                value={mag}
                onChangeText={setMag}
                keyboardType="decimal-pad"
                placeholder="10.00"
                placeholderTextColor={Colors.amber.dim}
              />
            </>
          )}

          {loadType === LoadType.TRIANGULAR && (
            <>
              <Text style={styles.modalLabel}>Başlangıç (m):</Text>
              <TextInput
                style={styles.modalInput}
                value={startPos}
                onChangeText={setStartPos}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={Colors.amber.dim}
              />
              <Text style={styles.modalLabel}>Bitiş (m):</Text>
              <TextInput
                style={styles.modalInput}
                value={endPos}
                onChangeText={setEndPos}
                keyboardType="decimal-pad"
                placeholder="6.00"
                placeholderTextColor={Colors.amber.dim}
              />
              <Text style={styles.modalLabel}>Max Şiddet (kN/m):</Text>
              <TextInput
                style={styles.modalInput}
                value={mag}
                onChangeText={setMag}
                keyboardType="decimal-pad"
                placeholder="10.00"
                placeholderTextColor={Colors.amber.dim}
              />
            </>
          )}

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalButtonCancel}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.modalButtonText}>İPTAL</Text>
            </TouchableOpacity>
            <View style={styles.buttonSpacer} />
            <TouchableOpacity
              style={styles.modalButtonOk}
              onPress={handleAdd}
              activeOpacity={0.7}
            >
              <Text style={styles.modalButtonText}>EKLE</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// ============================================================================
// RESULTS SCREEN
// ============================================================================

const ResultsScreen: React.FC = () => {
  const { results, setShowResults } = useReactionStore();

  if (!results || !results.isValid) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>HESAPLAMA BAŞARISIZ</Text>
        <Text style={styles.errorMessage}>{results?.errorMessage || 'Bilinmeyen hata'}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setShowResults(false)}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>GERİ DÖN</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.resultsContainer}>
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>HESAP SONUÇLARI</Text>
        <TouchableOpacity
          style={styles.closeResultsButton}
          onPress={() => setShowResults(false)}
          activeOpacity={0.7}
        >
          <Text style={styles.closeResultsText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Reactions */}
      <View style={styles.resultSection}>
        <Text style={styles.resultSectionTitle}>REAKSİYONLAR</Text>
        {Array.from(results.reactions.entries()).map(([idx, r]) => (
          <View key={idx} style={styles.resultItem}>
            <Text style={styles.resultLabel}>Mesnet #{Number(idx) + 1}</Text>
            <View style={styles.resultValues}>
              <Text style={styles.resultValue}>R_x = {r.horizontal.toFixed(2)} kN</Text>
              <Text style={styles.resultValue}>R_y = {r.vertical.toFixed(2)} kN</Text>
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

      {/* Diagrams */}
      <ReactionDiagrams results={results} />
    </ScrollView>
  );
};

// ============================================================================
// MAIN SCREEN
// ============================================================================

export const ReactionScreen: React.FC = () => {
  const { showResults, calculate, results } = useReactionStore();

  if (showResults && results) {
    return <ResultsScreen />;
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <PresetSelector />
        <BeamVisualization />
        <BeamConfig />
        <SupportManager />
        <LoadManager />
      </ScrollView>

      {/* Calculate Button */}
      <TouchableOpacity style={styles.calculateButton} onPress={calculate} activeOpacity={0.7}>
        <Text style={styles.calculateButtonText}>HESAPLA ▶</Text>
      </TouchableOpacity>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.amber.dim,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.secondary,
    fontWeight: 'bold',
  },

  // Preset Grid
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: Spacing.xs,
  },
  presetButton: {
    width: '48%',
    marginTop: Spacing.xs,
    marginRight: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.amber.dim,
  },
  presetButtonActive: {
    backgroundColor: Colors.amber.bg,
    borderColor: Colors.amber.secondary,
  },
  presetButtonText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.amber.primary,
    textAlign: 'center',
  },
  presetButtonTextActive: {
    color: Colors.amber.secondary,
    fontWeight: 'bold',
  },

  // Beam Config
  numericInput: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.md,
    color: Colors.amber.primary,
    backgroundColor: Colors.black,
    borderWidth: 1,
    borderColor: Colors.amber.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
  },

  // Item List (Supports/Loads)
  itemList: {
    marginTop: Spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.sm,
    backgroundColor: Colors.black,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    marginBottom: Spacing.xs,
  },
  itemInfo: {
    flex: 1,
  },
  itemLabel: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.primary,
    fontWeight: 'bold',
  },
  itemSublabel: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.gray[300],
    marginTop: 2,
  },
  emptyText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.gray[300],
    textAlign: 'center',
    padding: Spacing.md,
    fontStyle: 'italic',
  },
  addButton: {
    width: 44,
    height: 44,
    backgroundColor: Colors.status.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  addButtonText: {
    color: Colors.black,
    fontSize: 20,
    fontWeight: 'bold',
  },
  removeButton: {
    width: 44,
    height: 44,
    backgroundColor: Colors.status.error,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  removeButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.sm,
    fontWeight: 'bold',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.black,
    borderWidth: 2,
    borderColor: Colors.amber.primary,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 320,
  },
  modalTitle: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.md,
    color: Colors.amber.secondary,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  modalLabel: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.primary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  modalInput: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.primary,
    backgroundColor: Colors.black,
    borderWidth: 1,
    borderColor: Colors.amber.dim,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
    minHeight: 44,
  },
  modalOptions: {
    flexDirection: 'row',
    marginTop: Spacing.xs,
  },
  modalOption: {
    flex: 1,
    padding: Spacing.sm,
    backgroundColor: Colors.black,
    borderWidth: 1,
    borderColor: Colors.amber.dim,
    marginRight: Spacing.xs,
    minHeight: 44,
    justifyContent: 'center',
  },
  modalOptionActive: {
    backgroundColor: Colors.amber.bg,
    borderColor: Colors.amber.secondary,
  },
  modalOptionText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.amber.primary,
    textAlign: 'center',
  },
  modalOptionTextActive: {
    color: Colors.amber.secondary,
    fontWeight: 'bold',
  },
  buttonSpacer: {
    width: Spacing.sm,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
  },
  modalButtonCancel: {
    flex: 1,
    padding: Spacing.sm,
    backgroundColor: Colors.gray[200],
    borderWidth: 1,
    borderColor: Colors.gray[300],
  },
  modalButtonOk: {
    flex: 1,
    padding: Spacing.sm,
    backgroundColor: Colors.amber.primary,
    borderWidth: 1,
    borderColor: Colors.amber.secondary,
  },
  modalButtonText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.black,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  loadTypeSelector: {
    flexDirection: 'row',
    marginTop: Spacing.xs,
  },
  loadTypeButton: {
    flex: 1,
    padding: Spacing.sm,
    backgroundColor: Colors.black,
    borderWidth: 1,
    borderColor: Colors.amber.dim,
    marginRight: Spacing.xs,
    minHeight: 44,
    justifyContent: 'center',
  },
  loadTypeButtonActive: {
    backgroundColor: Colors.amber.bg,
    borderColor: Colors.amber.secondary,
  },
  loadTypeButtonText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.primary,
    textAlign: 'center',
  },
  loadTypeButtonTextActive: {
    color: Colors.amber.secondary,
    fontWeight: 'bold',
  },

  // Calculate Button
  calculateButton: {
    margin: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.amber.primary,
    borderWidth: 2,
    borderColor: Colors.amber.secondary,
    borderRadius: 4,
  },
  calculateButtonText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.md,
    color: Colors.black,
    textAlign: 'center',
    fontWeight: 'bold',
  },

  // Results
  resultsContainer: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.amber.dim,
  },
  resultsTitle: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.md,
    color: Colors.amber.secondary,
    fontWeight: 'bold',
  },
  closeResultsButton: {
    width: 44,
    height: 44,
    backgroundColor: Colors.status.error,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  closeResultsText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  resultSection: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.amber.dim,
  },
  resultSectionTitle: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.secondary,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
  },
  resultItem: {
    marginBottom: Spacing.sm,
  },
  resultLabel: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.primary,
    fontWeight: 'bold',
  },
  resultValues: {
    marginLeft: Spacing.sm,
  },
  resultValue: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.gray[300],
    marginBottom: 2,
  },

  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  errorTitle: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.md,
    color: Colors.status.error,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
  },
  errorMessage: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.gray[300],
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  backButton: {
    padding: Spacing.sm,
    backgroundColor: Colors.gray[200],
    borderWidth: 1,
    borderColor: Colors.amber.dim,
  },
  backButtonText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.primary,
  },

  // Beam Visualization
  beamVisualization: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.amber.dim,
    backgroundColor: Colors.gray[100],
  },
  beamCanvas: {
    height: BEAM_VIEW_HEIGHT,
    position: 'relative',
    marginTop: Spacing.sm,
  },
  beamLine: {
    position: 'absolute',
    top: BEAM_VIEW_HEIGHT / 2 - 2,
    left: BEAM_PADDING,
    right: BEAM_PADDING,
    height: 4,
    backgroundColor: Colors.amber.primary,
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
    backgroundColor: Colors.gray[300],
  },
  dimensionTickLeft: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 1,
    height: 10,
    backgroundColor: Colors.gray[300],
  },
  dimensionTickRight: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 1,
    height: 10,
    backgroundColor: Colors.gray[300],
  },
  dimensionText: {
    position: 'absolute',
    bottom: 5,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.gray[300],
  },
  supportSymbol: {
    position: 'absolute',
    top: BEAM_VIEW_HEIGHT / 2 + 5,
    alignItems: 'center',
    width: 30,
  },
  pinnedSupport: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rollerSupport: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fixedSupport: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportText: {
    fontSize: 24,
    color: Colors.amber.secondary,
  },
  supportLabel: {
    position: 'absolute',
    bottom: -15,
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs - 2,
    color: Colors.gray[300],
  },
  loadPoint: {
    position: 'absolute',
    top: BEAM_VIEW_HEIGHT / 2 - 40,
    alignItems: 'center',
    width: 40,
  },
  loadArrow: {
    fontSize: 20,
    color: Colors.status.error,
  },
  loadLabelSmall: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs - 3,
    color: Colors.gray[300],
  },
  loadUDL: {
    position: 'absolute',
    top: BEAM_VIEW_HEIGHT / 2 - 35,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 176, 0, 0.1)',
    borderTopWidth: 1,
    borderTopColor: Colors.status.error,
  },
  udlArrows: {
    marginTop: 2,
  },
  udlArrow: {
    fontSize: 10,
    color: Colors.status.error,
    letterSpacing: 2,
  },
  loadMoment: {
    position: 'absolute',
    top: BEAM_VIEW_HEIGHT / 2 - 35,
    alignItems: 'center',
    width: 30,
  },
  momentSymbol: {
    fontSize: 20,
    color: Colors.status.info,
  },
  loadTriangular: {
    position: 'absolute',
    top: BEAM_VIEW_HEIGHT / 2 - 35,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 176, 0, 0.1)',
    borderLeftWidth: 1,
    borderLeftColor: Colors.status.error,
    borderRightWidth: 2,
    borderRightColor: Colors.status.error,
  },
});
