import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Colors, Typography, Spacing, Shapes, Effects } from '@/utils/theme';
import { useEducationStore } from '@/store/useEducationStore';
import { getLessonById } from '@/data/lessons';
import type { LessonStep, BeamVisualConfig } from '@/types/education';
import { StepIndicator } from '@/components/beam/StepIndicator';
import { FormulaDisplay } from '@/components/beam/FormulaDisplay';
import { Math } from '@/components/math';
import { AnimatedBeamDiagram } from '@/components/beam/AnimatedBeamDiagram';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ide.bg,
  },
  contentContainer: {
    flex: 1,
    padding: Spacing.md,
  },
  stepScrollView: {
    flex: 1,
  },
  
  // Theory styles
  theoryContent: {
    paddingBottom: Spacing.lg,
  },
  heading1: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.lg,
    color: Colors.ide.yellow,
    fontWeight: '900',
    marginBottom: Spacing.md,
  },
  heading2: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: '900',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  paragraph: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.gray[800],
    lineHeight: 22,
    marginBottom: Spacing.xs,
  },
  bold: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.ide.yellow,
    fontWeight: 'bold',
    marginVertical: Spacing.xs,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  bullet: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.ide.accent,
    width: 24,
    fontWeight: '900',
  },
  bulletText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.gray[800],
    flex: 1,
    lineHeight: 22,
  },
  divider: {
    height: 2,
    backgroundColor: Colors.black,
    marginVertical: Spacing.md,
  },
  spacer: {
    height: Spacing.md,
  },
  
  // Formula/Explanation styles
  explanationBox: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.black,
    borderLeftWidth: 4,
    borderLeftColor: Colors.ide.yellow,
  },
  
  // Visualization styles
  visualDescription: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.gray[700],
    marginBottom: Spacing.md,
  },
  
  // Quiz styles
  quizBoxContainer: {
    position: 'relative',
    marginRight: 4,
    marginBottom: 4,
  },
  quizBoxShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: Colors.black,
  },
  quizBox: {
    padding: Spacing.md,
    backgroundColor: Colors.ide.toolWindow,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
  },
  quizQuestion: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.md,
    color: Colors.white,
    marginBottom: Spacing.lg,
    lineHeight: 24,
    fontWeight: 'bold',
  },
  optionsContainer: {
    gap: Spacing.md,
  },
  optionContainer: {
    position: 'relative',
    marginRight: 4,
  },
  optionShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: Colors.black,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.ide.bg,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
  },
  optionSelected: {
    backgroundColor: Colors.ide.accent,
  },
  optionCorrect: {
    backgroundColor: Colors.status.success,
  },
  optionWrong: {
    backgroundColor: Colors.status.error,
  },
  optionId: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: '900',
    marginRight: Spacing.sm,
    width: 24,
  },
  optionText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    fontWeight: 'bold',
    flex: 1,
  },
  explanationResult: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.black,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.ide.yellow,
  },
  explanationLabel: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.ide.yellow,
    fontWeight: '900',
    marginBottom: Spacing.xs,
  },
  explanationText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.gray[800],
    lineHeight: 22,
  },
  
  // Navigation
  navButtons: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.md,
    borderTopWidth: Shapes.borderWidth.brutal,
    borderTopColor: Colors.black,
    backgroundColor: Colors.ide.header,
  },
  navButton: {
    flex: 1,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
    backgroundColor: Colors.ide.selection,
  },
  navButtonDisabled: {
    backgroundColor: Colors.gray[150],
    opacity: 0.5,
  },
  navButtonPrimary: {
    backgroundColor: Colors.ide.yellow,
  },
  navButtonText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    fontWeight: '900',
  },
  navButtonTextDisabled: {
    color: Colors.gray[500],
  },
  navButtonTextPrimary: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.black,
    fontWeight: '900',
  },
  
  // Error
  errorText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.md,
    color: Colors.status.error,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  unknownStep: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  unknownText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.status.warning,
  },
});

// ============================================================================
// THEORY CONTENT RENDERER
// ============================================================================

interface TheoryContentProps {
  text: string;
}

const TheoryContent: React.FC<TheoryContentProps> = ({ text }) => {
  // Simple markdown-like parsing for terminal style
  const lines = (text || '').split('\n');
  
  return (
    <View style={styles.theoryContent}>
      {lines.map((line, index) => {
        if (line.startsWith('# ')) {
          return (
            <Text key={index} style={styles.heading1}>
              {line.replace('# ', '')}
            </Text>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <Text key={index} style={styles.heading2}>
              {line.replace('## ', '')}
            </Text>
          );
        }
        if (line.startsWith('- ')) {
          return (
            <View key={index} style={styles.bulletRow}>
              <Text style={styles.bullet}>{'>'}</Text>
              <Text style={styles.bulletText}>{line.replace('- ', '')}</Text>
            </View>
          );
        }
        if (line.match(/^\d\. /)) {
          return (
            <View key={index} style={styles.bulletRow}>
              <Text style={styles.bullet}>{line.match(/^\d/)?.[0]}.</Text>
              <Text style={styles.bulletText}>{line.replace(/^\d\. /, '')}</Text>
            </View>
          );
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          const content = line.replace(/\*\*/g, '');
          return (
            <Math key={index} formula={content} style={styles.bold} />
          );
        }
        if (line === '---') {
          return <View key={index} style={styles.divider} />;
        }
        if (line.trim() === '') {
          return <View key={index} style={styles.spacer} />;
        }
        return (
          <Text key={index} style={styles.paragraph}>
            {line}
          </Text>
        );
      })}
    </View>
  );
};

// ============================================================================
// STEP CONTENT RENDERER
// ============================================================================

interface StepContentRendererProps {
  step: LessonStep;
  onQuizAnswer?: (isCorrect: boolean) => void;
}

const StepContentRenderer: React.FC<StepContentRendererProps> = ({ step, onQuizAnswer }) => {
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null);
  const [showResult, setShowResult] = React.useState(false);
  
  const handleOptionSelect = (optionId: string, isCorrect: boolean) => {
    setSelectedOption(optionId);
    setShowResult(true);
    
    // Delay callback to show result
    setTimeout(() => {
      onQuizAnswer?.(isCorrect);
    }, 1500);
  };
  
  switch (step.type) {
    case 'theory':
      return (
        <ScrollView style={styles.stepScrollView} showsVerticalScrollIndicator={false}>
          <TheoryContent text={step.content.textTR || step.content.text || ''} />
        </ScrollView>
      );
      
    case 'formula':
      return (
        <ScrollView style={styles.stepScrollView} showsVerticalScrollIndicator={false}>
          {step.content.formula && (
            <Math formula={step.content.formula} block size={24} />
          )}
          {step.content.explanationTR && (
            <View style={styles.explanationBox}>
              <TheoryContent text={step.content.explanationTR} />
            </View>
          )}
        </ScrollView>
      );
      
    case 'visualization':
      return (
        <ScrollView style={styles.stepScrollView} showsVerticalScrollIndicator={false}>
          {step.content.textTR && (
            <Text style={styles.visualDescription}>{step.content.textTR}</Text>
          )}
          {step.content.beamConfig && (
            <AnimatedBeamDiagram config={step.content.beamConfig} />
          )}
        </ScrollView>
      );
      
    case 'quiz':
      const question = step.content.question;
      if (!question) return null;
      
      return (
        <ScrollView style={styles.stepScrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.quizBoxContainer}>
            <View style={styles.quizBoxShadow} />
            <View style={styles.quizBox}>
              <Text style={styles.quizQuestion}>{question.questionTR || question.question}</Text>
              
              {question.options && (
                <View style={styles.optionsContainer}>
                  {question.options.map((option) => {
                    const isSelected = selectedOption === option.id;
                    const showCorrect = showResult && option.isCorrect;
                    const showWrong = showResult && isSelected && !option.isCorrect;
                    
                    return (
                      <View key={option.id} style={styles.optionContainer}>
                        <View style={styles.optionShadow} />
                        <TouchableOpacity
                          style={[
                            styles.optionButton,
                            isSelected && styles.optionSelected,
                            showCorrect && styles.optionCorrect,
                            showWrong && styles.optionWrong,
                          ]}
                          onPress={() => !showResult && handleOptionSelect(option.id, option.isCorrect)}
                          disabled={showResult}
                          activeOpacity={0.9}
                        >
                          <Text style={styles.optionId}>{option.id.toUpperCase()}</Text>
                          <Text style={styles.optionText}>
                            {option.textTR || option.text}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              )}
              
              {showResult && question.explanationTR && (
                <View style={styles.explanationResult}>
                  <Text style={styles.explanationLabel}>{'>>>'} AÇIKLAMA:</Text>
                  <Text style={styles.explanationText}>{question.explanationTR}</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      );
      
    default:
      return (
        <View style={styles.unknownStep}>
          <Text style={styles.unknownText}>Bilinmeyen adım türü: {step.type}</Text>
        </View>
      );
  }
};

// ============================================================================
// LESSON PLAYER COMPONENT
// ============================================================================

export const LessonPlayer: React.FC = () => {
  const { 
    currentLessonId, 
    currentStepIndex, 
    nextStep, 
    prevStep, 
    completeLesson,
    exitLesson,
    awardXP,
  } = useEducationStore();
  
  const lesson = useMemo(() => {
    if (!currentLessonId) return null;
    return getLessonById(currentLessonId);
  }, [currentLessonId]);
  
  if (!lesson) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Ders bulunamadı</Text>
      </View>
    );
  }
  
  const currentStep = lesson.steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === lesson.steps.length - 1;
  
  const handleNext = () => {
    if (isLastStep) {
      completeLesson();
      awardXP(20); // Lesson completion bonus
    } else {
      nextStep();
    }
  };
  
  const handleQuizAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      const xp = currentStep.content.question?.xpReward || 10;
      awardXP(xp);
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Step Indicator */}
      <StepIndicator 
        currentStep={currentStepIndex + 1}
        totalSteps={lesson.steps.length}
        stepTitle={currentStep.titleTR || currentStep.title}
      />
      
      {/* Step Content */}
      <View style={styles.contentContainer}>
        <StepContentRenderer 
          step={currentStep} 
          onQuizAnswer={handleQuizAnswer}
        />
      </View>
      
      {/* Navigation Buttons */}
      <View style={styles.navButtons}>
        <TouchableOpacity
          style={[styles.navButton, isFirstStep && styles.navButtonDisabled]}
          onPress={prevStep}
          disabled={isFirstStep}
        >
          <Text style={[styles.navButtonText, isFirstStep && styles.navButtonTextDisabled]}>
            {'◄'} GERİ
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonPrimary]}
          onPress={handleNext}
        >
          <Text style={styles.navButtonTextPrimary}>
            {isLastStep ? 'TAMAMLA ✓' : 'İLERİ ►'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LessonPlayer;
