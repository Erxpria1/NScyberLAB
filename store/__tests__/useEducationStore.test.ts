import { renderHook, act } from '@testing-library/react-native';
import { useEducationStore } from '../useEducationStore';
import { DEFAULT_USER_PROGRESS, AVAILABLE_BADGES } from '@/types/education';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Reset store before each test
beforeEach(() => {
  const store = useEducationStore.getState();
  store.goToMenu();
  // Reset progress to default
  useEducationStore.setState({
    progress: { ...DEFAULT_USER_PROGRESS },
    quizStreak: 0,
  });
});

describe('useEducationStore', () => {
  describe('initial state', () => {
    it('should have correct initial values', () => {
      const { result } = renderHook(() => useEducationStore());
      
      expect(result.current.activeMode).toBe('menu');
      expect(result.current.currentLessonId).toBeNull();
      expect(result.current.currentStepIndex).toBe(0);
      expect(result.current.lessonCompleted).toBe(false);
      expect(result.current.currentQuiz).toBeNull();
      expect(result.current.quizStreak).toBe(0);
      expect(result.current.progress.xpPoints).toBe(0);
    });
  });

  describe('navigation', () => {
    it('should set mode correctly', () => {
      const { result } = renderHook(() => useEducationStore());
      
      act(() => {
        result.current.setMode('lesson');
      });
      
      expect(result.current.activeMode).toBe('lesson');
    });

    it('should reset state when going to menu', () => {
      const { result } = renderHook(() => useEducationStore());
      
      act(() => {
        result.current.startLesson('test-lesson');
        result.current.goToMenu();
      });
      
      expect(result.current.activeMode).toBe('menu');
      expect(result.current.currentLessonId).toBeNull();
      expect(result.current.currentStepIndex).toBe(0);
    });
  });

  describe('lesson actions', () => {
    it('should start lesson correctly', () => {
      const { result } = renderHook(() => useEducationStore());
      
      act(() => {
        result.current.startLesson('simple-beam-reactions');
      });
      
      expect(result.current.activeMode).toBe('lesson');
      expect(result.current.currentLessonId).toBe('simple-beam-reactions');
      expect(result.current.currentStepIndex).toBe(0);
      expect(result.current.lessonCompleted).toBe(false);
    });

    it('should navigate to next step', () => {
      const { result } = renderHook(() => useEducationStore());
      
      act(() => {
        result.current.startLesson('simple-beam-reactions');
        result.current.nextStep();
      });
      
      expect(result.current.currentStepIndex).toBe(1);
    });

    it('should navigate to previous step', () => {
      const { result } = renderHook(() => useEducationStore());
      
      act(() => {
        result.current.startLesson('simple-beam-reactions');
        result.current.nextStep();
        result.current.nextStep();
        result.current.prevStep();
      });
      
      expect(result.current.currentStepIndex).toBe(1);
    });

    it('should not go below step 0', () => {
      const { result } = renderHook(() => useEducationStore());
      
      act(() => {
        result.current.startLesson('simple-beam-reactions');
        const moved = result.current.prevStep();
        expect(moved).toBe(false);
      });
      
      expect(result.current.currentStepIndex).toBe(0);
    });

    it('should complete lesson and add to completed list', () => {
      const { result } = renderHook(() => useEducationStore());
      
      act(() => {
        result.current.startLesson('test-lesson');
        result.current.completeLesson();
      });
      
      expect(result.current.lessonCompleted).toBe(true);
      expect(result.current.progress.completedLessons).toContain('test-lesson');
    });
  });

  describe('quiz actions', () => {
    it('should start quiz with questions', () => {
      const { result } = renderHook(() => useEducationStore());
      const questionIds = ['q1', 'q2', 'q3'];
      
      act(() => {
        result.current.startQuiz(questionIds);
      });
      
      expect(result.current.activeMode).toBe('quiz');
      expect(result.current.currentQuiz).not.toBeNull();
      expect(result.current.currentQuiz?.questions).toEqual(questionIds);
      expect(result.current.currentQuiz?.currentIndex).toBe(0);
    });

    it('should submit answer and record result', () => {
      const { result } = renderHook(() => useEducationStore());
      
      act(() => {
        result.current.startQuiz(['q1', 'q2']);
        result.current.submitAnswer(true, 10, 15);
      });
      
      expect(result.current.currentQuiz?.results.length).toBe(1);
      expect(result.current.currentQuiz?.results[0].isCorrect).toBe(true);
      expect(result.current.currentQuiz?.results[0].xpEarned).toBe(10);
    });

    it('should navigate to next question', () => {
      const { result } = renderHook(() => useEducationStore());
      
      act(() => {
        result.current.startQuiz(['q1', 'q2', 'q3']);
        result.current.nextQuestion();
      });
      
      expect(result.current.currentQuiz?.currentIndex).toBe(1);
    });

    it('should return false when no more questions', () => {
      const { result } = renderHook(() => useEducationStore());
      
      act(() => {
        result.current.startQuiz(['q1']);
        const hasNext = result.current.nextQuestion();
        expect(hasNext).toBe(false);
      });
    });
  });

  describe('progress actions', () => {
    it('should award XP correctly', () => {
      const { result } = renderHook(() => useEducationStore());
      
      act(() => {
        result.current.awardXP(50);
      });
      
      expect(result.current.progress.xpPoints).toBe(50);
    });

    it('should update level when XP reaches threshold', () => {
      const { result } = renderHook(() => useEducationStore());
      
      act(() => {
        result.current.awardXP(100);
      });
      
      expect(result.current.getCurrentLevel()).toBe(2);
    });

    it('should update streak on correct answer', () => {
      const { result } = renderHook(() => useEducationStore());
      
      act(() => {
        result.current.updateStreak(true);
        result.current.updateStreak(true);
        result.current.updateStreak(true);
      });
      
      expect(result.current.quizStreak).toBe(3);
      expect(result.current.progress.streak).toBe(3);
    });

    it('should reset streak on wrong answer', () => {
      const { result } = renderHook(() => useEducationStore());
      
      act(() => {
        result.current.updateStreak(true);
        result.current.updateStreak(true);
        result.current.updateStreak(false);
      });
      
      expect(result.current.quizStreak).toBe(0);
      expect(result.current.progress.streak).toBe(2); // Max streak preserved
    });
  });

  describe('badge unlocking', () => {
    it('should unlock first_lesson badge', () => {
      const { result } = renderHook(() => useEducationStore());
      
      act(() => {
        result.current.startLesson('test-lesson');
        result.current.completeLesson();
      });
      
      const hasBadge = result.current.progress.badges.some(b => b.id === 'first_lesson');
      expect(hasBadge).toBe(true);
    });

    it('should unlock xp_100 badge', () => {
      const { result } = renderHook(() => useEducationStore());
      
      act(() => {
        result.current.awardXP(100);
        result.current.checkAndUnlockBadges();
      });
      
      const hasBadge = result.current.progress.badges.some(b => b.id === 'xp_100');
      expect(hasBadge).toBe(true);
    });

    it('should unlock streak_5 badge', () => {
      const { result } = renderHook(() => useEducationStore());
      
      act(() => {
        for (let i = 0; i < 5; i++) {
          result.current.updateStreak(true);
        }
        result.current.checkAndUnlockBadges();
      });
      
      const hasBadge = result.current.progress.badges.some(b => b.id === 'streak_5');
      expect(hasBadge).toBe(true);
    });
  });

  describe('getters', () => {
    it('should calculate current level correctly', () => {
      const { result } = renderHook(() => useEducationStore());
      
      act(() => {
        result.current.awardXP(250);
      });
      
      expect(result.current.getCurrentLevel()).toBe(3);
    });

    it('should calculate XP for next level correctly', () => {
      const { result } = renderHook(() => useEducationStore());
      
      act(() => {
        result.current.awardXP(75);
      });
      
      expect(result.current.getXPForNextLevel()).toBe(25);
    });

    it('should check if lesson is completed', () => {
      const { result } = renderHook(() => useEducationStore());
      
      expect(result.current.hasCompletedLesson('test-lesson')).toBe(false);
      
      act(() => {
        result.current.startLesson('test-lesson');
        result.current.completeLesson();
      });
      
      expect(result.current.hasCompletedLesson('test-lesson')).toBe(true);
    });
  });
});
