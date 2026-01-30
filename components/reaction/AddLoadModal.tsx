// ============================================================================
// ADD LOAD MODAL COMPONENT
// Bottom-sheet modal for adding loads with mobile-friendly UI
// ============================================================================

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LoadType } from '@/utils/structural/reactionCalculator';
import {
  RetroModal,
  RetroQuickInput,
  RetroPositionInput,
  RetroRangeInput,
  ModalActions,
} from '@/components/retro';
import { LoadTypeSelector } from './LoadTypeSelector';
import { validateLoadInputs } from '@/utils/structural/loadValidation';
import { createLoad, createPreviewLoad, QUICK_MAGNITUDES, formatLoadDescription } from '@/utils/structural/loadFactory';
import { useReactionStore } from '@/store/useReactionStore';
import { Colors, Typography, Spacing } from '@/utils/theme';

// ============================================================================
// TYPES
// ============================================================================

export interface AddLoadModalProps {
  visible: boolean;
  loadType: LoadType;
  onLoadTypeChange: (type: LoadType) => void;
  onClose: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const AddLoadModal: React.FC<AddLoadModalProps> = ({
  visible,
  loadType,
  onLoadTypeChange,
  onClose,
}) => {
  const { addLoad, beamLength } = useReactionStore();

  // Input states
  const [pos, setPos] = useState('3');
  const [mag, setMag] = useState('10');
  const [startPos, setStartPos] = useState('0');
  const [endPos, setEndPos] = useState('6');
  const [error, setError] = useState<string | null>(null);

  // Reset inputs when modal opens
  useEffect(() => {
    if (visible) {
      setPos('3');
      setMag('10');
      setStartPos('0');
      setEndPos(beamLength.toString());
      setError(null);
    }
  }, [visible, beamLength]);

  // Get preview load for visualization
  const previewLoad = createPreviewLoad(loadType, pos, mag, startPos, endPos, beamLength);

  const handleAdd = () => {
    // Validate inputs based on load type
    const validation = validateLoadInputs(loadType, pos, mag, startPos, endPos, beamLength);
    if (!validation.isValid) {
      setError(validation.error ?? 'Geçersiz giriş');
      return;
    }

    // Create load using factory
    const loadInputs = {
      position: parseFloat(pos.replace(',', '.')),
      magnitude: parseFloat(mag.replace(',', '.')),
      startPosition: parseFloat(startPos.replace(',', '.')),
      endPosition: parseFloat(endPos.replace(',', '.')),
    };

    const newLoad = createLoad(loadType, loadInputs);
    addLoad(newLoad);
    onClose();
  };

  return (
    <RetroModal
      visible={visible}
      onClose={onClose}
      title="YÜK EKLE"
      variant="bottomSheet"
      actions={
        <ModalActions
          onCancel={onClose}
          onConfirm={handleAdd}
          cancelLabel="İPTAL"
          confirmLabel="EKLE"
          confirmColor={Colors.amber.primary}
          renderExtra={() => (
            <Text style={styles.previewLabel}>
              {previewLoad ? formatLoadDescription(previewLoad) : 'Önizleme...'}
            </Text>
          )}
        />
      }
    >
      {/* Load Type Selector */}
      <LoadTypeSelector
        selected={loadType}
        onSelect={onLoadTypeChange}
        label="Yük Tipi"
      />

      {/* Dynamic Inputs based on load type */}
      {loadType === LoadType.POINT && (
        <>
          <RetroPositionInput
            label="Pozisyon (m):"
            value={pos}
            onChangeText={(text) => {
              setPos(text);
              setError(null);
            }}
            beamLength={beamLength}
          />
          <RetroQuickInput
            label="Büyüklük (kN):"
            value={mag}
            onChangeText={(text) => {
              setMag(text);
              setError(null);
            }}
            quickValues={[...QUICK_MAGNITUDES]}
            placeholder="10.00"
            error={error ?? undefined}
          />
        </>
      )}

      {loadType === LoadType.UDL && (
        <>
          <RetroRangeInput
            startValue={startPos}
            endValue={endPos}
            onStartChange={(text) => {
              setStartPos(text);
              setError(null);
            }}
            onEndChange={(text) => {
              setEndPos(text);
              setError(null);
            }}
            beamLength={beamLength}
            error={error ?? undefined}
          />
          <RetroQuickInput
            label="Şiddet (kN/m):"
            value={mag}
            onChangeText={(text) => {
              setMag(text);
              setError(null);
            }}
            quickValues={[5, 10, 15, 20]}
            placeholder="5.00"
          />
        </>
      )}

      {loadType === LoadType.MOMENT && (
        <>
          <RetroPositionInput
            label="Pozisyon (m):"
            value={pos}
            onChangeText={(text) => {
              setPos(text);
              setError(null);
            }}
            beamLength={beamLength}
          />
          <RetroQuickInput
            label="Moment (kNm):"
            value={mag}
            onChangeText={(text) => {
              setMag(text);
              setError(null);
            }}
            quickValues={[5, 10, 15, 20, 25]}
            placeholder="10.00"
            error={error ?? undefined}
          />
        </>
      )}

      {loadType === LoadType.TRIANGULAR && (
        <>
          <RetroRangeInput
            startValue={startPos}
            endValue={endPos}
            onStartChange={(text) => {
              setStartPos(text);
              setError(null);
            }}
            onEndChange={(text) => {
              setEndPos(text);
              setError(null);
            }}
            beamLength={beamLength}
            error={error ?? undefined}
          />
          <RetroQuickInput
            label="Max Şiddet (kN/m):"
            value={mag}
            onChangeText={(text) => {
              setMag(text);
              setError(null);
            }}
            quickValues={[5, 10, 15, 20]}
            placeholder="10.00"
          />
        </>
      )}
    </RetroModal>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  previewLabel: {
    fontFamily: Typography.family.mono,
    fontSize: 11,
    color: Colors.retro.cyan,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.retro.gray,
    borderWidth: 2,
    borderColor: Colors.black,
    paddingVertical: 12,
    alignItems: 'center',
    minHeight: 44,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: Colors.retro.primary,
    borderWidth: 2,
    borderColor: Colors.black,
    paddingVertical: 12,
    alignItems: 'center',
    minHeight: 44,
  },
  buttonText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.black,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
  },
});
