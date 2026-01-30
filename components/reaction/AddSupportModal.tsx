// ============================================================================
// ADD SUPPORT MODAL COMPONENT
// Bottom-sheet modal for adding supports with mobile-friendly UI
// ============================================================================

import React, { useState, useEffect } from 'react';
import { SupportType, type Support } from '@/utils/structural/reactionCalculator';
import { RetroModal, ModalActions, RetroPositionInput } from '@/components/retro';
import { SupportTypeSelector } from './LoadTypeSelector';
import { validateLoadPosition } from '@/utils/structural/loadValidation';
import { useReactionStore } from '@/store/useReactionStore';
import { Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '@/utils/theme';

// ============================================================================
// TYPES
// ============================================================================

export interface AddSupportModalProps {
  visible: boolean;
  onClose: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const AddSupportModal: React.FC<AddSupportModalProps> = ({ visible, onClose }) => {
  const { addSupport, beamLength } = useReactionStore();
  const [supportType, setSupportType] = useState<SupportType>(SupportType.PINNED);
  const [position, setPosition] = useState('0');
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setSupportType(SupportType.PINNED);
      setPosition('0');
      setError(null);
    }
  }, [visible]);

  const handleAdd = () => {
    const validation = validateLoadPosition(position, beamLength, 'Pozisyon');
    if (!validation.isValid) {
      setError(validation.error ?? 'Geçersiz pozisyon');
      return;
    }

    const newSupport: Support = {
      type: supportType,
      position: validation.value!,
    };

    addSupport(newSupport);
    onClose();
  };

  return (
    <RetroModal
      visible={visible}
      onClose={onClose}
      title="YENİ MESNET EKLE"
      variant="bottomSheet"
      actions={
        <ModalActions
          onCancel={onClose}
          onConfirm={handleAdd}
          cancelLabel="İPTAL"
          confirmLabel="EKLE"
          confirmColor={Colors.amber.primary}
        />
      }
    >
      {/* Support Type Selector */}
      <SupportTypeSelector
        selected={supportType}
        onSelect={setSupportType}
        label="TİP SEÇİMİ"
      />

      {/* Position Input with Quick Values */}
      <RetroPositionInput
        label="POZİSYON (m):"
        value={position}
        onChangeText={(text) => {
          setPosition(text);
          setError(null);
        }}
        beamLength={beamLength}
        error={error ?? undefined}
      />

      {/* Validation Message */}
      {error && (
        <Text style={styles.validationHint}>0 ≤ pozisyon ≤ {beamLength.toFixed(1)}m</Text>
      )}
    </RetroModal>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  validationHint: {
    fontFamily: Typography.family.mono,
    fontSize: 10,
    color: Colors.retro.gray,
    textAlign: 'center',
    marginTop: 8,
  },
});
