// ============================================================================
// MATERIAL DATABASE SCREEN - Malzeme Veritabanı Ekranı
// TS 500, TS 708, TS 648 standartlarına göre malzeme özellikleri
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Colors, Typography, Spacing, Shapes } from '@/utils/theme';
import {
  CONCRETE_MATERIALS,
  STEEL_MATERIALS,
  TIMBER_MATERIALS,
  ALUMINUM_MATERIALS,
  getMaterialsByType,
  getMaterialByGrade,
  type Material,
} from '@/utils/structural/materialDatabase';

// ============================================================================
// TYPES
// ============================================================================

interface MaterialDatabaseScreenProps {
  onBack: () => void;
}

type MaterialCategory = 'all' | 'concrete' | 'steel' | 'timber' | 'aluminum';

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

const PropertyRow: React.FC<{ label: string; value: string; unit?: string }> = ({
  label,
  value,
  unit,
}) => (
  <View style={styles.propertyRow}>
    <Text style={styles.propertyLabel}>{label}</Text>
    <Text style={styles.propertyValue}>
      {value} <Text style={styles.propertyUnit}>{unit || ''}</Text>
    </Text>
  </View>
);

// ============================================================================
// MAIN SCREEN
// ============================================================================

export const MaterialDatabaseScreen: React.FC<MaterialDatabaseScreenProps> = ({ onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState<MaterialCategory>('all');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const materials = useMemo(() => {
    if (selectedCategory === 'all') {
      return [
        ...Object.values(CONCRETE_MATERIALS),
        ...Object.values(STEEL_MATERIALS),
        ...Object.values(TIMBER_MATERIALS),
        ...Object.values(ALUMINUM_MATERIALS),
      ];
    }
    return getMaterialsByType(selectedCategory);
  }, [selectedCategory]);

  const categoryNames: Record<MaterialCategory, string> = {
    all: 'TÜMÜ',
    concrete: 'BETON',
    steel: 'ÇELİK',
    timber: 'AHŞAP',
    aluminum: 'ALÜMİNYUM',
  };

  const formatMaterial = (material: Material) => {
    if (material.type === 'concrete') {
      return {
        name: material.grade,
        rows: [
          { label: 'Sınıf', value: material.grade, unit: '' },
          { label: 'fck', value: material.fck.toString(), unit: 'MPa' },
          { label: 'fcd', value: material.fcd.toFixed(1), unit: 'MPa' },
          { label: 'E', value: (material.E / 1000).toFixed(0), unit: 'GPa' },
          { label: 'G', value: (material.G / 1000).toFixed(1), unit: 'GPa' },
          { label: 'ν', value: material.nu.toFixed(2), unit: '' },
          { label: 'α', value: (material.alpha * 1e6).toFixed(1), unit: '×10⁻⁶/°C' },
          { label: 'γ', value: material.gamma.toString(), unit: 'kN/m³' },
          { label: 'fctm', value: material.tensileStrength.toFixed(1), unit: 'MPa' },
        ],
      };
    } else if (material.type === 'steel') {
      return {
        name: material.grade,
        rows: [
          { label: 'Sınıf', value: material.grade, unit: '' },
          { label: 'fyk', value: material.fyk.toString(), unit: 'MPa' },
          { label: 'fyd', value: material.fyd.toFixed(1), unit: 'MPa' },
          { label: 'fuk', value: material.fuk.toString(), unit: 'MPa' },
          { label: 'E', value: (material.E / 1000).toFixed(0), unit: 'GPa' },
          { label: 'G', value: (material.G / 1000).toFixed(1), unit: 'GPa' },
          { label: 'ν', value: material.nu.toFixed(2), unit: '' },
          { label: 'α', value: (material.alpha * 1e6).toFixed(1), unit: '×10⁻⁶/°C' },
          { label: 'γ', value: material.gamma.toString(), unit: 'kN/m³' },
        ],
      };
    } else if (material.type === 'timber') {
      return {
        name: material.grade,
        rows: [
          { label: 'Tür', value: material.grade, unit: '' },
          { label: 'fck', value: material.fck.toString(), unit: 'MPa' },
          { label: 'ft', value: material.ft.toString(), unit: 'MPa' },
          { label: 'E', value: (material.E / 1000).toFixed(1), unit: 'GPa' },
          { label: 'G', value: (material.G / 1000).toFixed(1), unit: 'GPa' },
          { label: 'ν', value: material.nu.toFixed(2), unit: '' },
          { label: 'α', value: (material.alpha * 1e6).toFixed(1), unit: '×10⁻⁶/°C' },
          { label: 'γ', value: material.gamma.toString(), unit: 'kN/m³' },
        ],
      };
    } else {
      return {
        name: material.grade,
        rows: [
          { label: 'Sınıf', value: material.grade, unit: '' },
          { label: 'fy', value: material.fy.toString(), unit: 'MPa' },
          { label: 'E', value: (material.E / 1000).toFixed(0), unit: 'GPa' },
          { label: 'G', value: (material.G / 1000).toFixed(1), unit: 'GPa' },
          { label: 'ν', value: material.nu.toFixed(2), unit: '' },
          { label: 'α', value: (material.alpha * 1e6).toFixed(1), unit: '×10⁻⁶/°C' },
          { label: 'γ', value: material.gamma.toString(), unit: 'kN/m³' },
        ],
      };
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← GERİ</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MALZEME VERİTABANI</Text>
      </View>

      {/* Category Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {(Object.keys(categoryNames) as MaterialCategory[]).map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryCard,
              selectedCategory === category && styles.categoryCardSelected,
            ]}
            onPress={() => {
              setSelectedCategory(category);
              setSelectedMaterial(null);
            }}
          >
            <Text style={styles.categoryText}>{categoryNames[category]}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.content}>
        {selectedMaterial ? (
          <>
            {/* Material Detail View */}
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>{formatMaterial(selectedMaterial).name}</Text>
              <RetroButton
                label="← LİSTE"
                onPress={() => setSelectedMaterial(null)}
                color={Colors.gray[600]}
              />
            </View>

            <View style={styles.propertiesContainer}>
              {formatMaterial(selectedMaterial).rows.map((row, idx) => (
                <PropertyRow
                  key={idx}
                  label={row.label}
                  value={row.value}
                  unit={row.unit}
                />
              ))}
            </View>

            {/* Formül Info */}
            {selectedMaterial.type === 'concrete' && (
              <View style={styles.formulaBox}>
                <Text style={styles.formulaTitle}>TS 500 BETON FORMÜLÜ</Text>
                <Text style={styles.formulaText}>
                  E = 3250 × √(fck) + 14000 MPa
                </Text>
                <Text style={styles.formulaText}>
                  G = E / (2 × (1 + ν))
                </Text>
              </View>
            )}

            {selectedMaterial.type === 'steel' && (
              <View style={styles.formulaBox}>
                <Text style={styles.formulaTitle}>TS 500 ÇELİK FORMÜLÜ</Text>
                <Text style={styles.formulaText}>
                  Es = 200000 MPa (sabit)
                </Text>
                <Text style={styles.formulaText}>
                  Gs = Es / (2 × (1 + ν)) = 76923 MPa
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            {/* Material List */}
            <Text style={styles.listTitle}>
              [{materials.length} MALZEME BULUNDU]
            </Text>
            {materials.map(material => (
              <TouchableOpacity
                key={material.grade || (material as any).name}
                style={styles.materialCard}
                onPress={() => setSelectedMaterial(material)}
              >
                <View style={styles.materialHeader}>
                  <Text style={styles.materialName}>
                    {material.type === 'concrete' ? 'BETON ' : ''}
                    {material.grade || (material as any).name}
                  </Text>
                  <Text style={[
                    styles.materialType,
                    material.type === 'concrete' && styles.typeConcrete,
                    material.type === 'steel' && styles.typeSteel,
                    material.type === 'timber' && styles.typeTimber,
                    material.type === 'aluminum' && styles.typeAluminum,
                  ]}>
                    {material.type.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.materialPreview}>
                  {material.type === 'concrete' && (
                    <>
                      <Text style={styles.previewText}>fck: {material.fck} MPa</Text>
                      <Text style={styles.previewText}>E: {(material.E / 1000).toFixed(0)} GPa</Text>
                    </>
                  )}
                  {material.type === 'steel' && (
                    <>
                      <Text style={styles.previewText}>fyk: {material.fyk} MPa</Text>
                      <Text style={styles.previewText}>E: {(material.E / 1000).toFixed(0)} GPa</Text>
                    </>
                  )}
                  {material.type === 'timber' && (
                    <>
                      <Text style={styles.previewText}>fck: {material.fck} MPa</Text>
                      <Text style={styles.previewText}>E: {(material.E / 1000).toFixed(1)} GPa</Text>
                    </>
                  )}
                  {material.type === 'aluminum' && (
                    <>
                      <Text style={styles.previewText}>fy: {material.fy} MPa</Text>
                      <Text style={styles.previewText}>E: {(material.E / 1000).toFixed(0)} GPa</Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </View>
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
  categoryScroll: {
    backgroundColor: Colors.black,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  categoryCard: {
    backgroundColor: Colors.gray[700],
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    marginRight: Spacing.sm,
  },
  categoryCardSelected: {
    backgroundColor: Colors.amber.primary,
  },
  categoryText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.black,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  listTitle: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.gray[600],
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  materialCard: {
    backgroundColor: Colors.ide.toolWindow,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  materialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  materialName: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    fontWeight: 'bold',
  },
  materialType: {
    fontFamily: Typography.family.mono,
    fontSize: 8,
    color: Colors.gray[600],
    backgroundColor: Colors.black,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  typeConcrete: {
    color: Colors.gray[300],
  },
  typeSteel: {
    color: Colors.retro.secondary,
  },
  typeTimber: {
    color: Colors.retro.orange,
  },
  typeAluminum: {
    color: Colors.retro.blue,
  },
  materialPreview: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  previewText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.gray[600],
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  detailTitle: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.md,
    color: Colors.amber.primary,
    fontWeight: 'bold',
  },
  retroButton: {
    paddingVertical: 8,
    paddingHorizontal: Spacing.sm,
    borderWidth: Shapes.borderWidth.brutal,
    borderRadius: 0,
    minHeight: 36,
  },
  retroButtonText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.black,
    fontWeight: 'bold',
  },
  propertiesContainer: {
    backgroundColor: Colors.ide.toolWindow,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
    padding: Spacing.sm,
  },
  propertyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[700],
  },
  propertyLabel: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.gray[600],
  },
  propertyValue: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    fontWeight: 'bold',
  },
  propertyUnit: {
    fontSize: 10,
    color: Colors.gray[600],
  },
  formulaBox: {
    backgroundColor: Colors.black,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.amber.primary,
    padding: Spacing.sm,
    marginTop: Spacing.md,
  },
  formulaTitle: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.amber.primary,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  formulaText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.gray[600],
    fontStyle: 'italic',
  },
});

export default MaterialDatabaseScreen;
