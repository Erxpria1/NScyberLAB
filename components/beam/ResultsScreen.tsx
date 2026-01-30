import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Colors, Typography, Spacing, Shapes, Effects } from '@/utils/theme';
import { useEducationStore } from '@/store/useEducationStore';

export const ResultsScreen: React.FC = () => {
  const { currentQuiz, progress, goToMenu } = useEducationStore();
  
  if (!currentQuiz) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Sonuç bulunamadı</Text>
        <TouchableOpacity style={styles.menuButton} onPress={goToMenu}>
          <Text style={styles.menuButtonText}>MENÜYE DÖN</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const correctCount = currentQuiz.results.filter(r => r.isCorrect).length;
  const totalQuestions = currentQuiz.results.length;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const totalXP = currentQuiz.totalScore;
  
  const getGrade = () => {
    if (accuracy >= 90) return { grade: 'A', color: Colors.status.success, text: 'Mükemmel!' };
    if (accuracy >= 70) return { grade: 'B', color: Colors.amber.primary, text: 'İyi!' };
    if (accuracy >= 50) return { grade: 'C', color: Colors.status.warning, text: 'Geçti' };
    return { grade: 'D', color: Colors.status.error, text: 'Tekrar dene' };
  };
  
  const gradeInfo = getGrade();
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>[ OTURUM_SONLANDI: RAPOR ]</Text>
      </View>
      
      {/* Grade */}
      <View style={styles.gradeBoxContainer}>
        <View style={styles.gradeBoxShadow} />
        <View style={styles.gradeBox}>
          <Text style={styles.gradeLabel}>OTR_NOTU</Text>
          <Text style={[styles.gradeValue, { color: gradeInfo.color }]}>
            {gradeInfo.grade}
          </Text>
        </View>
        <Text style={styles.gradeSubtext}>{">"} {gradeInfo.text.toUpperCase()}_</Text>
      </View>
      
      {/* Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statBoxContainer}>
          <View style={styles.statBoxShadow} />
          <View style={styles.statBox}>
            <Text style={styles.statValueLabel}>DOĞRU</Text>
            <Text style={styles.statValue}>{correctCount}/{totalQuestions}</Text>
          </View>
        </View>
        <View style={styles.statBoxContainer}>
          <View style={styles.statBoxShadow} />
          <View style={styles.statBox}>
            <Text style={styles.statValueLabel}>DOĞRULUK</Text>
            <Text style={styles.statValue}>{accuracy}%</Text>
          </View>
        </View>
        <View style={styles.statBoxContainer}>
          <View style={styles.statBoxShadow} />
          <View style={styles.statBox}>
            <Text style={styles.statValueLabel}>XP_KAZANCI</Text>
            <Text style={[styles.statValue, { color: Colors.status.success }]}>
              +{totalXP}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Question breakdown */}
      <View style={styles.resultsList}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>[ OTURUM_MODÜL_GÜNLÜĞÜ ]</Text>
          <View style={styles.sectionLine} />
        </View>
        {currentQuiz.results.map((result, index) => (
          <View key={index} style={styles.resultRowContainer}>
            <View style={styles.resultRowShadow} />
            <View style={styles.resultRow}>
              <Text style={styles.resultIndex}>#{index + 1}</Text>
              <Text style={[
                styles.resultStatus,
                result.isCorrect ? styles.resultCorrect : styles.resultWrong,
              ]}>
                {result.isCorrect ? '✓ KARARLI' : '✗ HATA'}
              </Text>
              <Text style={[
                styles.resultXP,
                { color: result.xpEarned > 0 ? Colors.status.success : Colors.gray[500] },
              ]}>
                +{result.xpEarned}P
              </Text>
            </View>
          </View>
        ))}
      </View>
      
      {/* Total progress */}
      <View style={styles.totalProgress}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>[ GENEL_BELLEK: SENK ]</Text>
          <View style={styles.sectionLine} />
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>TOPLAM_XP:</Text>
          <Text style={styles.progressValue}>{progress.xpPoints}</Text>
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>SERİ_AYE:</Text>
          <Text style={styles.progressValue}>{progress.streak} 🔥</Text>
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>NİŞAN_KİLİDİ:</Text>
          <Text style={styles.progressValue}>{progress.badges.length}</Text>
        </View>
      </View>
      
      {/* Menu button */}
      <View style={styles.buttonContainer}>
        <View style={styles.buttonShadow} />
        <TouchableOpacity style={styles.menuButton} onPress={goToMenu} activeOpacity={0.9}>
          <Text style={styles.menuButtonText}>[ OTURUMU_KES ]</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ide.bg,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  errorText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.md,
    color: Colors.status.error,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  
  // Header
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ide.border,
  },
  headerTitle: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.md,
    color: Colors.ide.accent,
    fontWeight: 'bold',
  },
  
  // Grade
  gradeBoxContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  gradeBoxShadow: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 140,
    height: 140,
    backgroundColor: Colors.black,
  },
  gradeBox: {
    padding: Spacing.lg,
    backgroundColor: Colors.ide.yellow,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    textShadowColor: Colors.amber.glow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  gradeLabel: {
    fontFamily: Typography.family.mono,
    fontSize: 10,
    color: Colors.black,
    fontWeight: '900',
    marginBottom: 4,
  },
  gradeValue: {
    fontFamily: Typography.family.mono,
    fontSize: 72,
    fontWeight: '900',
  },
  gradeSubtext: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.amber.primary,
    marginTop: Spacing.sm,
    letterSpacing: 1,
  },
  
  // Stats
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statBoxContainer: {
    flex: 1,
    position: 'relative',
  },
  statBoxShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: Colors.black,
  },
  statBox: {
    padding: Spacing.md,
    backgroundColor: Colors.ide.toolWindow,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
    alignItems: 'center',
  },
  statValueLabel: {
    fontFamily: Typography.family.mono,
    fontSize: 8,
    color: Colors.gray[500],
    marginBottom: 4,
  },
  statValue: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.lg,
    color: Colors.amber.secondary,
    fontWeight: 'bold',
  },
  
  // Breakdown
  resultsList: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.amber.primary,
    fontWeight: 'bold',
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
  },
  resultRowContainer: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  resultRowShadow: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: -2,
    bottom: -2,
    backgroundColor: Colors.black,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    backgroundColor: Colors.ide.toolWindow,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
  },
  resultIndex: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.gray[500],
    width: 30,
  },
  resultInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  resultStatus: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    fontWeight: 'bold',
  },
  resultCorrect: {
    color: Colors.status.success,
  },
  resultWrong: {
    color: Colors.status.error,
  },
  resultTime: {
    fontFamily: Typography.family.mono,
    fontSize: 8,
    color: Colors.gray[600],
  },
  resultXP: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    fontWeight: 'bold',
  },
  
  // Total progress
  totalProgress: {
    marginBottom: Spacing.xl,
    padding: Spacing.md,
    backgroundColor: Colors.ide.mint,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  progressLabel: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.black,
    fontWeight: '900',
  },
  progressValue: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.black,
    fontWeight: 'bold',
  },
  
  // Menu button
  buttonContainer: {
    position: 'relative',
    marginBottom: Spacing.xl,
    marginRight: 4,
  },
  buttonShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: Colors.black,
  },
  menuButton: {
    padding: Spacing.md,
    backgroundColor: Colors.ide.pink,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
    alignItems: 'center',
  },
  menuButtonText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.black,
    fontWeight: '900',
    letterSpacing: 2,
  },
});

export default ResultsScreen;
