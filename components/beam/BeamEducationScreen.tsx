import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Effects, Shapes } from '@/utils/theme';
import { useEducationStore } from '@/store/useEducationStore';
import { ALL_LESSONS, isLessonLocked } from '@/data/lessons';
import type { Lesson } from '@/types/education';
import { LessonPlayer } from '@/components/beam/LessonPlayer';
import { QuizScreen } from '@/components/beam/QuizScreen';
import { ResultsScreen } from '@/components/beam/ResultsScreen';

const { width } = Dimensions.get('window');

// ============================================================================
// HEADER COMPONENT
// ============================================================================

const Header: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { progress, getCurrentLevel, getXPForNextLevel } = useEducationStore();
  const level = getCurrentLevel();
  const xpToNext = getXPForNextLevel();
  
  return (
    <View style={styles.header}>
      <View style={styles.headerToolbar}>
        <TouchableOpacity onPress={onBack} style={styles.brutalBackButton}>
          <Text style={styles.brutalBackButtonText}>🗙 BAĞLANTIYI KES</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitleText}>KİRİŞ_EĞİTIM.sys</Text>
        </View>
      </View>

      <View style={styles.brutalStatsGrid}>
        <View style={[styles.brutalStatBox, { backgroundColor: Colors.ide.mint }]}>
          <Text style={styles.brutalStatLabel}>LVL</Text>
          <Text style={styles.brutalStatValue}>0{level}</Text>
        </View>
        <View style={[styles.brutalStatBox, { backgroundColor: Colors.ide.yellow }]}>
          <Text style={styles.brutalStatLabel}>XP</Text>
          <Text style={styles.brutalStatValue}>{progress.xpPoints}</Text>
        </View>
        <View style={[styles.brutalStatBox, { backgroundColor: Colors.ide.pink }]}>
          <Text style={styles.brutalStatLabel}>STRK</Text>
          <Text style={styles.brutalStatValue}>{progress.streak}</Text>
        </View>
      </View>

      <View style={styles.brutalProgressContainer}>
        <Text style={styles.brutalProgressLabel}>SENK_DURUMU: {Math.round((1 - xpToNext/100) * 100)}%</Text>
        <View style={styles.brutalProgressBar}>
          <View 
            style={[
              styles.brutalProgressFill, 
              { width: `${Math.min(100, (1 - (xpToNext / 100)) * 100)}%` }
            ]} 
          />
        </View>
      </View>
    </View>
  );
};

// ============================================================================
// LESSON CARD COMPONENT
// ============================================================================

interface LessonCardProps {
  lesson: Lesson;
  isCompleted: boolean;
  isLocked: boolean;
  onPress: () => void;
}

const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  isCompleted,
  isLocked,
  onPress,
}) => {
  return (
    <View style={styles.brutalCardContainer}>
      <View style={styles.brutalCardShadow} />
      <TouchableOpacity
        style={[
          styles.brutalCard,
          isLocked && styles.brutalCardLocked,
          isCompleted && styles.brutalCardCompleted,
        ]}
        onPress={onPress}
        disabled={isLocked}
        activeOpacity={0.9}
      >
        <View style={styles.brutalCardTop}>
          <View style={styles.brutalIconBox}>
            <Text style={styles.brutalIconText}>{isLocked ? '🔒' : isCompleted ? '☑' : '◈'}</Text>
          </View>
          <View style={styles.brutalTitleBox}>
            <Text style={[styles.brutalTitle, isLocked && styles.brutalTitleLocked]}>
              {lesson.titleTR.toUpperCase()}
            </Text>
            <Text style={styles.brutalSubTitle}>SEKTÖR_0{lesson.id.length % 9}</Text>
          </View>
          <View style={styles.brutalMetaBox}>
            <Text style={styles.brutalMetaText}>{lesson.estimatedMinutes}M</Text>
          </View>
        </View>
        
        <View style={styles.brutalCardBody}>
          <Text style={[styles.brutalDescription, isLocked && styles.brutalDescLocked]} numberOfLines={2}>
            {lesson.descriptionTR}
          </Text>
        </View>

        <View style={styles.brutalCardFooter}>
          <View style={styles.brutalTagRow}>
            <View style={styles.brutalTag}>
              <Text style={styles.brutalTagText}>DÜĞÜM:{lesson.steps.length}</Text>
            </View>
            <View style={styles.brutalTag}>
              <Text style={styles.brutalTagText}>LVL:0{lesson.id.length % 3 + 1}</Text>
            </View>
          </View>
          <View style={styles.brutalStatusBox}>
            {isCompleted && <Text style={styles.statusSuccess}>[ TAMAMLANDI ]</Text>}
            {isLocked && <Text style={styles.statusError}>[ KİLİTLİ ]</Text>}
            {!isCompleted && !isLocked && <Text style={styles.statusInfo}>[ HAZIR ]</Text>}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

// ============================================================================
// MENU SCREEN
// ============================================================================

const MenuScreen: React.FC = () => {
  const { progress, startLesson } = useEducationStore();
  
  const lessonsWithStatus = useMemo(() => {
    return ALL_LESSONS.map(lesson => ({
      lesson,
      isCompleted: progress.completedLessons.includes(lesson.id),
      isLocked: isLessonLocked(lesson, progress.xpPoints),
    }));
  }, [progress.completedLessons, progress.xpPoints]);
  
  return (
    <View style={styles.menuContainer}>
      <ScrollView style={styles.menuContent} showsVerticalScrollIndicator={false}>
        {/* Section: Lessons */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>[ ANA_GÜNLÜK: MODÜLLER ]</Text>
            <View style={styles.sectionHeaderLine} />
          </View>
          {lessonsWithStatus.map(({ lesson, isCompleted, isLocked }) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              isCompleted={isCompleted}
              isLocked={isLocked}
              onPress={() => startLesson(lesson.id)}
            />
          ))}
        </View>
        
        {/* Section: Badges */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>[ BAŞARILAR: NİŞANLAR ]</Text>
            <View style={styles.sectionHeaderLine} />
          </View>
          <View style={styles.badgesGrid}>
            {progress.badges.length === 0 ? (
              <Text style={styles.emptyText}>{">"} NİŞAN_BULUNAMADI_</Text>
            ) : (
              progress.badges.map(badge => (
                <View key={badge.id} style={styles.badgeItem}>
                  <Text style={styles.badgeIcon}>{badge.icon}</Text>
                  <Text style={styles.badgeName}>{badge.nameTR.toUpperCase()}</Text>
                </View>
              ))
            )}
          </View>
        </View>
        
        {/* Section: Stats */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>[ SİSTEM: PERFORMANS ]</Text>
            <View style={styles.sectionHeaderLine} />
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValueTerm}>{progress.completedLessons.length}</Text>
              <Text style={styles.statLabelTerm}>DRS_TAM</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValueTerm}>{progress.quizHistory.length}</Text>
              <Text style={styles.statLabelTerm}>SORU_ÇÖZ</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValueTerm}>{progress.streak}</Text>
              <Text style={styles.statLabelTerm}>MAX_SERİ</Text>
            </View>
          </View>
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

// ============================================================================
// MAIN SCREEN
// ============================================================================

interface BeamEducationScreenProps {
  onBack: () => void;
}

export const BeamEducationScreen: React.FC<BeamEducationScreenProps> = ({ onBack }) => {
  const { activeMode, goToMenu } = useEducationStore();
  const insets = useSafeAreaInsets();

  const renderContent = () => {
    switch (activeMode) {
      case 'lesson':
        return <LessonPlayer />;
      case 'quiz':
        return <QuizScreen />;
      case 'results':
        return <ResultsScreen />;
      case 'menu':
      default:
        return <MenuScreen />;
    }
  };

  const handleBack = () => {
    if (activeMode === 'menu') {
      onBack();
    } else {
      goToMenu();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Header onBack={handleBack} />
      <View style={{ flex: 1 }}>
        {renderContent()}
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
    backgroundColor: Colors.ide.header,
    borderBottomWidth: Shapes.borderWidth.brutal,
    borderBottomColor: Colors.black,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  headerToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  brutalBackButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.ide.selection,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
    borderRadius: 0,
  },
  brutalBackButtonText: {
    fontFamily: Typography.family.mono,
    fontSize: 10,
    color: Colors.white,
    fontWeight: '900',
  },
  headerTitleBox: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.black,
  },
  headerTitleText: {
    fontFamily: Typography.family.mono,
    fontSize: 12,
    color: Colors.amber.primary,
    fontWeight: 'bold',
  },
  brutalStatsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  brutalStatBox: {
    flex: 1,
    padding: 8,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brutalStatLabel: {
    fontFamily: Typography.family.mono,
    fontSize: 8,
    color: Colors.black,
    fontWeight: '900',
    marginBottom: 2,
  },
  brutalStatValue: {
    fontFamily: Typography.family.mono,
    fontSize: 14,
    color: Colors.black,
    fontWeight: 'bold',
  },
  brutalProgressContainer: {
    gap: 4,
  },
  brutalProgressLabel: {
    fontFamily: Typography.family.mono,
    fontSize: 9,
    color: Colors.gray[600],
    fontWeight: 'bold',
  },
  brutalProgressBar: {
    height: 12,
    backgroundColor: Colors.black,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
    borderRadius: 0,
    overflow: 'hidden',
  },
  brutalProgressFill: {
    height: '100%',
    backgroundColor: Colors.ide.accent,
  },
  
  // Menu
  menuContainer: {
    flex: 1,
  },
  // Menu Content
  menuContent: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontFamily: Typography.family.mono,
    fontSize: 12,
    color: Colors.white,
    fontWeight: '900',
    letterSpacing: 1,
    backgroundColor: Colors.black,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sectionHeaderLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.black,
  },
  
  // Brutal Card System (JEDI Style)
  brutalCardContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
    marginRight: 4,
  },
  brutalCardShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: Colors.black,
  },
  brutalCard: {
    backgroundColor: Colors.ide.toolWindow,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
    padding: Spacing.md,
  },
  brutalCardLocked: {
    backgroundColor: Colors.gray[150],
  },
  brutalCardCompleted: {
    backgroundColor: Colors.ide.mint + '20',
  },
  brutalCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  brutalIconBox: {
    width: 32,
    height: 32,
    backgroundColor: Colors.ide.bg,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brutalIconText: {
    fontSize: 14,
  },
  brutalTitleBox: {
    flex: 1,
  },
  brutalTitle: {
    fontFamily: Typography.family.mono,
    fontSize: 14,
    color: Colors.white,
    fontWeight: '900',
  },
  brutalTitleLocked: {
    color: Colors.gray[600],
  },
  brutalSubTitle: {
    fontFamily: Typography.family.mono,
    fontSize: 8,
    color: Colors.gray[600],
    marginTop: 2,
  },
  brutalMetaBox: {
    backgroundColor: Colors.black,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  brutalMetaText: {
    fontFamily: Typography.family.mono,
    fontSize: 10,
    color: Colors.amber.primary,
    fontWeight: 'bold',
  },
  brutalCardBody: {
    marginBottom: Spacing.md,
  },
  brutalDescription: {
    fontFamily: Typography.family.mono,
    fontSize: 12,
    color: Colors.gray[800],
    lineHeight: 18,
  },
  brutalDescLocked: {
    color: Colors.gray[500],
  },
  brutalCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: Shapes.borderWidth.brutal,
    borderTopColor: Colors.black,
    paddingTop: Spacing.sm,
  },
  brutalTagRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  brutalTag: {
    backgroundColor: Colors.gray[150],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.black,
  },
  brutalTagText: {
    fontFamily: Typography.family.mono,
    fontSize: 8,
    color: Colors.black,
    fontWeight: 'bold',
  },
  brutalStatusBox: {
    alignItems: 'flex-end',
  },
  statusSuccess: {
    fontFamily: Typography.family.mono,
    fontSize: 10,
    color: Colors.status.success,
    fontWeight: '900',
  },
  statusError: {
    fontFamily: Typography.family.mono,
    fontSize: 10,
    color: Colors.status.error,
    fontWeight: '900',
  },
  statusInfo: {
    fontFamily: Typography.family.mono,
    fontSize: 10,
    color: Colors.ide.accent,
    fontWeight: '900',
  },

  // Achievements
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  badgeItem: {
    width: (width - Spacing.md * 2 - Spacing.sm * 2) / 3,
    aspectRatio: 1,
    backgroundColor: Colors.ide.toolWindow,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xs,
  },
  badgeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  badgeName: {
    fontFamily: Typography.family.mono,
    fontSize: 7,
    color: Colors.amber.secondary,
    textAlign: 'center',
    fontWeight: '900',
  },
  emptyText: {
    fontFamily: Typography.family.mono,
    fontSize: 10,
    color: Colors.gray[500],
    fontStyle: 'italic',
  },
  
  // Stats Dashboard
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.ide.toolWindow,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statValueTerm: {
    fontFamily: Typography.family.mono,
    fontSize: 18,
    color: Colors.white,
    fontWeight: '900',
  },
  statLabelTerm: {
    fontFamily: Typography.family.mono,
    fontSize: 8,
    color: Colors.gray[600],
    marginTop: 4,
    letterSpacing: 1,
  },
});

export default BeamEducationScreen;
