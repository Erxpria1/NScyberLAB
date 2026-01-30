// ============================================================================
// SECTION PROPERTIES SCREEN - Kesit Özellikleri Ekranı
// Atalet momenti (I), Kesit modülü (W), Dönüş yarıçapı (r) hesaplama
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
  calculateSectionProperties,
  getStandardProfile,
  getAllStandardProfiles,
  type SectionInput,
  type SectionProperties,
} from '@/utils/structural/sectionProperties';

// ============================================================================
// TYPES
// ============================================================================

interface SectionPropertiesScreenProps {
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

const ResultBox: React.FC<{ label: string; value: string; unit: string }> = ({
  label,
  value,
  unit,
}) => (
  <View style={styles.resultBox}>
    <Text style={styles.resultLabel}>{label}</Text>
    <Text style={styles.resultValue}>{value} <Text style={styles.resultUnit}>{unit}</Text></Text>
  </View>
);

// ============================================================================
// MAIN SCREEN
// ============================================================================

export const SectionPropertiesScreen: React.FC<SectionPropertiesScreenProps> = ({ onBack }) => {
  const [selectedShape, setSelectedShape] = useState<SectionInput['shape']>('rectangle');
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [inputValues, setInputValues] = useState<Record<string, string>>({
    width: '200',
    height: '300',
    diameter: '20',
    base: '200',
    thickness: '10',
    flangeWidth: '100',
    flangeThickness: '10',
    webThickness: '6',
  });

  const [properties, setProperties] = useState<SectionProperties | null>(null);
  const [useStandard, setUseStandard] = useState<boolean>(false);

  const shapeNames: Record<SectionInput['shape'], string> = {
    rectangle: 'Dikdörtgen',
    circle: 'Daire',
    triangle: 'Üçgen',
    'i-beam': 'I-Profil',
    't-beam': 'T-Profil',
    'l-beam': 'L-Profil',
    box: 'Kutu Profil',
    pipe: 'Boru',
  };

  const standardProfiles = useMemo(() => getAllStandardProfiles(), []);

  const handleCalculate = () => {
    try {
      let input: SectionInput;

      if (useStandard && selectedProfile) {
        const profile = getStandardProfile(selectedProfile);
        if (profile) {
          input = {
            shape: profile.shape,
            ...profile.dimensions,
          } as SectionInput;
        } else {
          return;
        }
      } else {
        switch (selectedShape) {
          case 'rectangle':
            input = {
              shape: 'rectangle',
              width: parseFloat(inputValues.width) || 0,
              height: parseFloat(inputValues.height) || 0,
            };
            break;
          case 'circle':
            input = {
              shape: 'circle',
              diameter: parseFloat(inputValues.diameter) || 0,
            };
            break;
          case 'triangle':
            input = {
              shape: 'triangle',
              base: parseFloat(inputValues.base) || 0,
              height: parseFloat(inputValues.height) || 0,
            };
            break;
          case 'i-beam':
            input = {
              shape: 'i-beam',
              height: parseFloat(inputValues.height) || 0,
              flangeWidth: parseFloat(inputValues.flangeWidth) || 0,
              flangeThickness: parseFloat(inputValues.flangeThickness) || 0,
              webThickness: parseFloat(inputValues.webThickness) || 0,
            };
            break;
          case 't-beam':
            input = {
              shape: 't-beam',
              height: parseFloat(inputValues.height) || 0,
              flangeWidth: parseFloat(inputValues.flangeWidth) || 0,
              flangeThickness: parseFloat(inputValues.flangeThickness) || 0,
              webThickness: parseFloat(inputValues.webThickness) || 0,
            };
            break;
          case 'l-beam':
            input = {
              shape: 'l-beam',
              height: parseFloat(inputValues.height) || 0,
              width: parseFloat(inputValues.width) || 0,
              thickness: parseFloat(inputValues.thickness) || 0,
            };
            break;
          case 'box':
            input = {
              shape: 'box',
              height: parseFloat(inputValues.height) || 0,
              width: parseFloat(inputValues.width) || 0,
              thickness: parseFloat(inputValues.thickness) || 0,
            };
            break;
          case 'pipe':
            input = {
              shape: 'pipe',
              outerDiameter: parseFloat(inputValues.diameter) || 0,
              wallThickness: parseFloat(inputValues.thickness) || 0,
            };
            break;
          default:
            return;
        }
      }

      const result = calculateSectionProperties(input);
      setProperties(result);
    } catch (error) {
      console.error('Calculation error:', error);
    }
  };

  const renderInputFields = () => {
    if (useStandard) return null;

    switch (selectedShape) {
      case 'rectangle':
      case 'triangle':
      case 'box':
        return (
          <>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Genişlik (mm):</Text>
              <TextInput
                style={styles.input}
                value={inputValues.width}
                onChangeText={(text) => setInputValues({ ...inputValues, width: text })}
                keyboardType="numeric"
                placeholder="200"
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Yükseklik (mm):</Text>
              <TextInput
                style={styles.input}
                value={inputValues.height}
                onChangeText={(text) => setInputValues({ ...inputValues, height: text })}
                keyboardType="numeric"
                placeholder="300"
              />
            </View>
          </>
        );

      case 'circle':
      case 'pipe':
        return (
          <>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Çap (mm):</Text>
              <TextInput
                style={styles.input}
                value={inputValues.diameter}
                onChangeText={(text) => setInputValues({ ...inputValues, diameter: text })}
                keyboardType="numeric"
                placeholder="20"
              />
            </View>
            {selectedShape === 'pipe' && (
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Duvar Kalınlığı (mm):</Text>
                <TextInput
                  style={styles.input}
                  value={inputValues.thickness}
                  onChangeText={(text) => setInputValues({ ...inputValues, thickness: text })}
                  keyboardType="numeric"
                  placeholder="3"
                />
              </View>
            )}
          </>
        );

      case 'triangle':
        return (
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Taban (mm):</Text>
            <TextInput
              style={styles.input}
              value={inputValues.base}
              onChangeText={(text) => setInputValues({ ...inputValues, base: text })}
              keyboardType="numeric"
              placeholder="200"
            />
          </View>
        );

      case 'i-beam':
      case 't-beam':
        return (
          <>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Yükseklik h (mm):</Text>
              <TextInput
                style={styles.input}
                value={inputValues.height}
                onChangeText={(text) => setInputValues({ ...inputValues, height: text })}
                keyboardType="numeric"
                placeholder="200"
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Başlık Genişliği bf (mm):</Text>
              <TextInput
                style={styles.input}
                value={inputValues.flangeWidth}
                onChangeText={(text) => setInputValues({ ...inputValues, flangeWidth: text })}
                keyboardType="numeric"
                placeholder="100"
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Başlık Kalınlığı tf (mm):</Text>
              <TextInput
                style={styles.input}
                value={inputValues.flangeThickness}
                onChangeText={(text) => setInputValues({ ...inputValues, flangeThickness: text })}
                keyboardType="numeric"
                placeholder="10"
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Gövde Kalınlığı tw (mm):</Text>
              <TextInput
                style={styles.input}
                value={inputValues.webThickness}
                onChangeText={(text) => setInputValues({ ...inputValues, webThickness: text })}
                keyboardType="numeric"
                placeholder="6"
              />
            </View>
          </>
        );

      case 'l-beam':
        return (
          <>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Yükseklik (mm):</Text>
              <TextInput
                style={styles.input}
                value={inputValues.height}
                onChangeText={(text) => setInputValues({ ...inputValues, height: text })}
                keyboardType="numeric"
                placeholder="100"
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Genişlik (mm):</Text>
              <TextInput
                style={styles.input}
                value={inputValues.width}
                onChangeText={(text) => setInputValues({ ...inputValues, width: text })}
                keyboardType="numeric"
                placeholder="100"
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Kalınlık (mm):</Text>
              <TextInput
                style={styles.input}
                value={inputValues.thickness}
                onChangeText={(text) => setInputValues({ ...inputValues, thickness: text })}
                keyboardType="numeric"
                placeholder="10"
              />
            </View>
          </>
        );

      default:
        return null;
    }
  };

  const renderStandardProfiles = () => {
    if (!useStandard) return null;

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.profileScroll}>
        {standardProfiles.map(profile => (
          <TouchableOpacity
            key={profile.code}
            style={[
              styles.profileCard,
              selectedProfile === profile.code && styles.profileCardSelected,
            ]}
            onPress={() => setSelectedProfile(profile.code)}
          >
            <Text style={styles.profileCode}>{profile.code}</Text>
            <Text style={styles.profileName}>{profile.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderResults = () => {
    if (!properties) return null;

    return (
      <View style={styles.resultsContainer}>
        <Text style={styles.sectionTitle}>[ HESAP SONUÇLARI ]</Text>
        <View style={styles.resultsGrid}>
          <ResultBox
            label="Alan (A)"
            value={properties.area.toFixed(0)}
            unit="mm²"
          />
          <ResultBox
            label="Iy (Atalet M.)"
            value={properties.iy.toFixed(0)}
            unit="mm⁴"
          />
          <ResultBox
            label="Iz (Atalet M.)"
            value={properties.iz.toFixed(0)}
            unit="mm⁴"
          />
          <ResultBox
            label="Wy (Kesit M.)"
            value={properties.wy.toFixed(0)}
            unit="mm³"
          />
          <ResultBox
            label="Wz (Kesit M.)"
            value={properties.wz.toFixed(0)}
            unit="mm³"
          />
          <ResultBox
            label="ry (Dönüş Y.)"
            value={properties.ry.toFixed(1)}
            unit="mm"
          />
          <ResultBox
            label="rz (Dönüş Y.)"
            value={properties.rz.toFixed(1)}
            unit="mm"
          />
          <ResultBox
            label="Centroid Y"
            value={properties.centroidY.toFixed(1)}
            unit="mm"
          />
        </View>
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
        <Text style={styles.headerTitle}>KESİT ÖZELLİKLERİ</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Mode Toggle */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeButton, !useStandard && styles.modeButtonActive]}
            onPress={() => setUseStandard(false)}
          >
            <Text style={[styles.modeButtonText, !useStandard && styles.modeButtonTextActive]}>
              ÖLÇÜ GİRİŞ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, useStandard && styles.modeButtonActive]}
            onPress={() => setUseStandard(true)}
          >
            <Text style={[styles.modeButtonText, useStandard && styles.modeButtonTextActive]}>
              STANDART PROFİL
            </Text>
          </TouchableOpacity>
        </View>

        {/* Shape Selector (only for custom input) */}
        {!useStandard && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>[ KESİT ŞEKLİ ]</Text>
            <View style={styles.shapeGrid}>
              {(Object.keys(shapeNames) as SectionInput['shape'][]).map(shape => (
                <TouchableOpacity
                  key={shape}
                  style={[
                    styles.shapeCard,
                    selectedShape === shape && styles.shapeCardSelected,
                  ]}
                  onPress={() => setSelectedShape(shape)}
                >
                  <Text style={styles.shapeText}>{shapeNames[shape]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Standard Profiles or Input Fields */}
        {useStandard ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>[ STANDART PROFİL ]</Text>
            {renderStandardProfiles()}
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>[ BÖLÜMLER (mm) ]</Text>
            {renderInputFields()}
          </View>
        )}

        {/* Calculate Button */}
        <View style={styles.buttonContainer}>
          <RetroButton label="HESAPLA" onPress={handleCalculate} color={Colors.retro.secondary} />
        </View>

        {/* Results */}
        {renderResults()}

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
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.black,
    marginBottom: Spacing.md,
  },
  modeButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: Colors.gray[600],
  },
  modeButtonActive: {
    borderBottomColor: Colors.amber.primary,
  },
  modeButtonText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.gray[600],
    fontWeight: 'bold',
  },
  modeButtonTextActive: {
    color: Colors.amber.primary,
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
  shapeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  shapeCard: {
    backgroundColor: Colors.ide.toolWindow,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
    padding: Spacing.sm,
    minWidth: 70,
    alignItems: 'center',
  },
  shapeCardSelected: {
    backgroundColor: Colors.amber.secondary,
  },
  shapeText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.black,
    fontWeight: 'bold',
  },
  profileScroll: {
    flexDirection: 'row',
  },
  profileCard: {
    backgroundColor: Colors.ide.toolWindow,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
    padding: Spacing.sm,
    marginRight: Spacing.sm,
    minWidth: 80,
    alignItems: 'center',
  },
  profileCardSelected: {
    backgroundColor: Colors.amber.secondary,
  },
  profileCode: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.black,
    fontWeight: '900',
  },
  profileName: {
    fontFamily: Typography.family.mono,
    fontSize: 8,
    color: Colors.gray[800],
    textAlign: 'center',
    marginTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.ide.toolWindow,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  inputLabel: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.gray[600],
    flex: 1,
  },
  input: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    backgroundColor: Colors.black,
    borderWidth: 1,
    borderColor: Colors.gray[700],
    padding: Spacing.xs,
    width: 80,
    textAlign: 'right',
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
  resultsContainer: {
    marginTop: Spacing.md,
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  resultBox: {
    backgroundColor: Colors.ide.toolWindow,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
    padding: Spacing.sm,
    minWidth: (Dimensions.get('window').width - Spacing.md * 2 - Spacing.sm * 3) / 2,
  },
  resultLabel: {
    fontFamily: Typography.family.mono,
    fontSize: 8,
    color: Colors.gray[600],
    marginBottom: 2,
  },
  resultValue: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.amber.secondary,
    fontWeight: 'bold',
  },
  resultUnit: {
    fontSize: 8,
    color: Colors.gray[600],
  },
});

export default SectionPropertiesScreen;
