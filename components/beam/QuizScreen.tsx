import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
} from 'react-native';
import { Colors, Typography, Spacing, Shapes, Effects } from '@/utils/theme';
import { useEducationStore } from '@/store/useEducationStore';
import { getQuizQuestionById, getRandomQuizQuestions } from '@/data/lessons';
import type { QuizQuestion } from '@/types/education';
import { AnimatedBeamDiagram } from './AnimatedBeamDiagram';

// ============================================================================
// QUESTION DISPLAY COMPONENT
// ============================================================================

interface QuestionDisplayProps {
  question: QuizQuestion;
  onAnswer: (isCorrect: boolean) => void;
  quizStreak: number;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  onAnswer,
  quizStreak,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [numericAnswer, setNumericAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(question.timeLimit || 60);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit(false);
      return;
    }
    
    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft]);
  
  // Reset on new question
  useEffect(() => {
    setSelectedOption(null);
    setNumericAnswer('');
    setShowResult(false);
    setTimeLeft(question.timeLimit || 60);
    fadeAnim.setValue(0);
  }, [question.id]);
  
  const handleSubmit = (correct: boolean) => {
    setIsCorrect(correct);
    setShowResult(true);
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    setTimeout(() => {
      onAnswer(correct);
    }, 2000);
  };
  
  const handleOptionSelect = (optionId: string, isOptionCorrect: boolean) => {
    if (showResult) return;
    setSelectedOption(optionId);
    handleSubmit(isOptionCorrect);
  };
  
  const handleNumericSubmit = () => {
    if (showResult) return;
    const answer = parseFloat(numericAnswer);
    const tolerance = question.tolerance || 0.01;
    const correct = Math.abs(answer - (question.correctAnswer || 0)) <= tolerance;
    handleSubmit(correct);
  };
  
  const handleTrueFalseSelect = (value: boolean) => {
    if (showResult) return;
    const correct = value === question.correctBoolean;
    handleSubmit(correct);
  };
  
  return (
    <View style={styles.questionContainer}>
      {/* Header with timer and streak */}
      <View style={styles.questionHeader}>
        <View style={styles.timerContainer}>
          <Text style={[
            styles.timerText,
            timeLeft <= 10 && styles.timerWarning,
          ]}>
            ⏱ {timeLeft}s
          </Text>
        </View>
        <View style={styles.streakContainer}>
          <Text style={styles.streakText}>🔥 {quizStreak}</Text>
        </View>
        <Text style={styles.xpBadge}>+{question.xpReward} XP</Text>
      </View>
      
      {/* Question */}
      <Text style={styles.questionText}>
        {question.questionTR || question.question}
      </Text>
      
      {/* Answer area based on type */}
      {question.type === 'multiple_choice' && question.options && (
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
                  onPress={() => handleOptionSelect(option.id, option.isCorrect)}
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
      
      {question.type === 'numeric' && (
        <View style={styles.numericContainer}>
          <View style={styles.numericInputRow}>
              <TextInput
                style={[
                  styles.numericInput,
                  showResult && (isCorrect ? styles.inputCorrect : styles.inputWrong),
                ]}
                value={numericAnswer}
                onChangeText={setNumericAnswer}
                keyboardType="numeric"
                placeholder="Cevabını yaz..."
                placeholderTextColor={Colors.gray[600]}
                editable={!showResult}
              />
              <Text style={styles.unitText}>{question.unit || ''}</Text>
            </View>
          {/* Submit button with shadow */}
          {!showResult && (
            <View style={styles.brutalButtonContainer}>
              <View style={styles.brutalButtonShadow} />
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleNumericSubmit}
                activeOpacity={0.9}
              >
                <Text style={styles.submitButtonText}>➔ GÖNDER</Text>
              </TouchableOpacity>
            </View>
          )}
          {showResult && (
            <Text style={styles.correctAnswer}>
              Doğru cevap: {question.correctAnswer} {question.unit}
            </Text>
          )}
        </View>
      )}
      
      {question.type === 'true_false' && (
        <View style={styles.trueFalseContainer}>
          <View style={styles.optionContainer}>
            <View style={styles.optionShadow} />
            <TouchableOpacity
              style={[
                styles.tfButton,
                showResult && question.correctBoolean === true && styles.optionCorrect,
                showResult && question.correctBoolean === false && styles.optionWrong,
              ]}
              onPress={() => handleTrueFalseSelect(true)}
              disabled={showResult}
              activeOpacity={0.9}
            >
              <Text style={styles.tfButtonText}>✓ DOĞRU</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.optionContainer}>
            <View style={styles.optionShadow} />
            <TouchableOpacity
              style={[
                styles.tfButton,
                showResult && question.correctBoolean === false && styles.optionCorrect,
                showResult && question.correctBoolean === true && styles.optionWrong,
              ]}
              onPress={() => handleTrueFalseSelect(false)}
              disabled={showResult}
              activeOpacity={0.9}
            >
              <Text style={styles.tfButtonText}>✗ YANLIŞ</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Result feedback */}
      {showResult && (
        <Animated.View style={[styles.resultFeedback, { opacity: fadeAnim }]}>
          <Text style={[
            styles.resultText,
            isCorrect ? styles.resultCorrect : styles.resultWrong,
          ]}>
            {isCorrect ? '✓ DOĞRU!' : '✗ YANLIŞ'}
          </Text>
          {question.explanationTR && (
            <Text style={styles.explanationText}>{question.explanationTR}</Text>
          )}
        </Animated.View>
      )}
    </View>
  );
};

// ============================================================================
// QUIZ SCREEN COMPONENT
// ============================================================================

export const QuizScreen: React.FC = () => {
  const {
    currentQuiz,
    quizStreak,
    submitAnswer,
    nextQuestion,
    endQuiz,
    startQuiz,
  } = useEducationStore();
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  
  // Initialize quiz if not started
  useEffect(() => {
    if (!currentQuiz) {
      const randomQuestions = getRandomQuizQuestions(5);
      if (randomQuestions.length > 0) {
        startQuiz(randomQuestions.map(q => q.id));
        setQuestions(randomQuestions);
      }
    } else if (questions.length === 0) {
      // Load questions from quiz session
      const loadedQuestions = currentQuiz.questions
        .map(id => getQuizQuestionById(id))
        .filter((q): q is QuizQuestion => q !== undefined);
      setQuestions(loadedQuestions);
    }
  }, [currentQuiz]);
  
  if (!currentQuiz || questions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Quiz yükleniyor...</Text>
      </View>
    );
  }
  
  const currentQuestion = questions[currentQuiz.currentIndex];
  const isLastQuestion = currentQuiz.currentIndex === questions.length - 1;
  
  const handleAnswer = (isCorrect: boolean) => {
    const xpReward = currentQuestion.xpReward;
    const timeSpent = (currentQuestion.timeLimit || 60) - 0; // Simplified
    
    submitAnswer(isCorrect, xpReward, timeSpent);
    
    setTimeout(() => {
      if (isLastQuestion) {
        endQuiz();
      } else {
        nextQuestion();
      }
    }, 500);
  };
  
  return (
    <View style={styles.container}>
      {/* Progress */}
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill,
            { width: `${((currentQuiz.currentIndex + 1) / questions.length) * 100}%` }
          ]} 
        />
      </View>
      <Text style={styles.progressText}>
        Soru {currentQuiz.currentIndex + 1}/{questions.length}
      </Text>
      
      {/* Question */}
      <QuestionDisplay
        key={currentQuestion.id}
        question={currentQuestion}
        onAnswer={handleAnswer}
        quizStreak={quizStreak}
      />
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[100],
    padding: Spacing.md,
  },
  loadingText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.md,
    color: Colors.amber.primary,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  
  // Progress
  progressBar: {
    height: 4,
    backgroundColor: Colors.gray[200],
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.1)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.amber.primary,
  },
  progressText: {
    fontFamily: Typography.family.mono,
    fontSize: 8,
    color: Colors.gray[600],
    textAlign: 'right',
    marginBottom: Spacing.md,
  },
  
  // Question container
  questionContainer: {
    flex: 1,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  timerContainer: {
    backgroundColor: Colors.ide.toolWindow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
  },
  timerText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.amber.primary,
    fontWeight: 'bold',
  },
  timerWarning: {
    color: Colors.status.error,
    fontWeight: '900',
  },
  streakContainer: {
    backgroundColor: Colors.ide.selection,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
  },
  streakText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.xs,
    color: Colors.white,
    fontWeight: '900',
  },
  xpBadge: {
    fontFamily: Typography.family.mono,
    fontSize: 10,
    color: Colors.black,
    backgroundColor: Colors.status.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
    fontWeight: '900',
  },
  
  questionText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.md,
    color: Colors.white,
    marginBottom: Spacing.lg,
    lineHeight: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.ide.yellow,
    paddingLeft: Spacing.md,
  },
  
  // Options
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
    backgroundColor: Colors.ide.toolWindow,
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
  
  // Numeric
  numericContainer: {
    marginTop: Spacing.md,
  },
  numericInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  numericInput: {
    flex: 1,
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.lg,
    color: Colors.white,
    backgroundColor: Colors.ide.bg,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
    padding: Spacing.md,
    textAlign: 'center',
  },
  inputCorrect: {
    borderColor: Colors.black,
    backgroundColor: Colors.status.success,
    color: Colors.black,
  },
  inputWrong: {
    borderColor: Colors.black,
    backgroundColor: Colors.status.error,
    color: Colors.white,
  },
  unitText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.md,
    color: Colors.gray[600],
    minWidth: 40,
  },
  brutalButtonContainer: {
    position: 'relative',
    marginTop: Spacing.md,
    marginRight: 4,
  },
  brutalButtonShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: Colors.black,
  },
  submitButton: {
    padding: Spacing.md,
    backgroundColor: Colors.ide.yellow,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
    alignItems: 'center',
  },
  submitButtonText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.black,
    fontWeight: '900',
    letterSpacing: 1,
  },
  correctAnswer: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.status.success,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  
  // True/False
  trueFalseContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  tfButton: {
    flex: 1,
    padding: Spacing.lg,
    backgroundColor: Colors.ide.toolWindow,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.black,
    alignItems: 'center',
  },
  tfButtonText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontWeight: '900',
  },
  
  // Result
  resultFeedback: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.black,
    borderWidth: Shapes.borderWidth.brutal,
    borderColor: Colors.ide.yellow,
  },
  resultText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  resultCorrect: {
    color: Colors.status.success,
  },
  resultWrong: {
    color: Colors.status.error,
  },
  explanationText: {
    fontFamily: Typography.family.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.gray[800],
    lineHeight: 22,
  },
});

export default QuizScreen;
