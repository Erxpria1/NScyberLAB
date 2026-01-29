import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useReactionStore } from '@/store/useReactionStore';
import { Colors, Typography, Spacing } from '@/utils/theme';
import { BEAM_TYPES, type BeamType } from '@/utils/structural/reactionCalculator';

interface BeamTypeButtonProps {
  beamType: BeamType;
  isSelected: boolean;
  onPress: () => void;
}

// Mini text-based schematic (no canvas, pure text for minimal footprint)
const MINI_SCHEMATICS: Record<string, string> = {
  simple:    '△─────○',
  cantilever: '▬─────',
  continuous: '△─△──○',
  'fixed-fixed': '▬─────▬',
};

const BeamTypeButton: React.FC<BeamTypeButtonProps> = ({ beamType, isSelected, onPress }) => (
  <TouchableOpacity
    style={[styles.button, isSelected && styles.buttonActive]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.schematic, isSelected && styles.schematicActive]}>
      {MINI_SCHEMATICS[beamType.id] || beamType.icon}
    </Text>
    <Text style={[styles.label, isSelected && styles.labelActive]}>
      {beamType.name}
    </Text>
  </TouchableOpacity>
);

export const BeamTypeSelector: React.FC = () => {
  const { loadBeamType, selectedPreset, beamLength } = useReactionStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSelect = (typeId: string) => {
    loadBeamType(typeId, beamLength);
    setIsExpanded(false); // Auto-collapse after selection
  };

  const selectedBeam = BEAM_TYPES.find(bt => bt.id === selectedPreset);

  return (
    <View style={styles.container}>
      {/* Compact header - always visible */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.8}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.title}>KİRİŞ TİPİ</Text>
          <Text style={styles.selectedName}>
            {selectedBeam?.name || 'Seçilmemiş'}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.lengthBadge}>L = {beamLength.toFixed(1)}m</Text>
          <Text style={[styles.chevron, isExpanded && styles.chevronOpen]}>
            {isExpanded ? '▲' : '▼'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Expandable content */}
      {isExpanded && (
        <View style={styles.content}>
          {/* Horizontal scrollable selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {BEAM_TYPES.map((beamType) => (
              <BeamTypeButton
                key={beamType.id}
                beamType={beamType}
                isSelected={selectedPreset === beamType.id}
                onPress={() => handleSelect(beamType.id)}
              />
            ))}
          </ScrollView>

          {/* Description */}
          {selectedBeam && (
            <View style={styles.descriptionRow}>
              <Text style={styles.descriptionLabel}>Açıklama:</Text>
              <Text style={styles.descriptionText}>{selectedBeam.description}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const BUTTON_WIDTH = 80;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.gray[100],
    borderBottomWidth: 1,
    borderBottomColor: Colors.amber.dim,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minHeight: 44, // Touch target
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.gray[400],
    marginBottom: 2,
  },
  selectedName: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.secondary,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  lengthBadge: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs - 1,
    color: Colors.gray[300],
    backgroundColor: Colors.black,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  chevron: {
    fontSize: 10,
    color: Colors.amber.primary,
  },
  chevronOpen: {
    fontSize: 10,
    color: Colors.amber.secondary,
  },
  content: {
    backgroundColor: Colors.black,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  scrollContent: {
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  button: {
    width: BUTTON_WIDTH,
    height: 56,
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.amber.dim,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  buttonActive: {
    backgroundColor: Colors.amber.bg,
    borderColor: Colors.amber.secondary,
  },
  schematic: {
    fontFamily: Typography.family.mono,
    fontSize: 11,
    color: Colors.gray[300],
    letterSpacing: -0.5,
  },
  schematicActive: {
    color: Colors.amber.secondary,
  },
  label: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs - 1,
    color: Colors.amber.primary,
  },
  labelActive: {
    color: Colors.amber.secondary,
    fontWeight: 'bold',
  },
  descriptionRow: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.amber.dim,
  },
  descriptionLabel: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.gray[400],
    marginRight: Spacing.xs,
  },
  descriptionText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.gray[300],
    flex: 1,
  },
});
