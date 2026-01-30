import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/utils/storage';
import type {
  EducationMode,
  UserProgress,
  QuizSession,
  QuizResult,
  Badge,
} from '@/types/education';
import {
  DEFAULT_USER_PROGRESS,
  AVAILABLE_BADGES,
  calculateLevel,
  XP_PER_LEVEL,
} from '@/types/education';
import { ALL_LESSONS } from '@/data/lessons';

// ============================================================================
// STORE INTERFACE
// ============================================================================

interface EducationState {
  // Navigation
  activeMode: EducationMode;
  
  // Lesson state
  currentLessonId: string | null;
  currentStepIndex: number;
  lessonCompleted: boolean;
  
  // Quiz state
  currentQuiz: QuizSession | null;
  quizStreak: number;
  
  // User progress (persisted)
  progress: UserProgress;
  
  // Navigation actions
  setMode: (mode: EducationMode) => void;
  goToMenu: () => void;
  
  // Lesson actions
  startLesson: (lessonId: string) => void;
  nextStep: () => boolean; // Returns true if moved to next step
  prevStep: () => boolean; // Returns true if moved to prev step
  completeLesson: () => void;
  exitLesson: () => void;
  
  // Quiz actions
  startQuiz: (questionIds: string[]) => void;
  submitAnswer: (isCorrect: boolean, xpReward: number, timeSpent: number) => void;
  nextQuestion: () => boolean; // Returns true if there's next question
  endQuiz: () => void;
  
  // Progress actions
  awardXP: (points: number) => void;
  updateStreak: (correct: boolean) => void;
  checkAndUnlockBadges: () => Badge[];
  
  // Getters
  getCurrentLevel: () => number;
  getXPForNextLevel: () => number;
  hasCompletedLesson: (lessonId: string) => boolean;
  getBadgeById: (badgeId: string) => Badge | undefined;
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useEducationStore = create<EducationState>()(
  persist(
    (set, get) => ({
      // Initial state
      activeMode: 'menu',
      currentLessonId: null,
      currentStepIndex: 0,
      lessonCompleted: false,
      currentQuiz: null,
      quizStreak: 0,
      progress: DEFAULT_USER_PROGRESS,

      // Navigation actions
      setMode: (mode) => set({ activeMode: mode }),
      
      goToMenu: () => set({
        activeMode: 'menu',
        currentLessonId: null,
        currentStepIndex: 0,
        lessonCompleted: false,
        currentQuiz: null,
      }),

      // Lesson actions
      startLesson: (lessonId) => set({
        activeMode: 'lesson',
        currentLessonId: lessonId,
        currentStepIndex: 0,
        lessonCompleted: false,
      }),

      nextStep: () => {
        const state = get();
        if (!state.currentLessonId) return false;
        
        // Get current lesson to check step count
        const lesson = ALL_LESSONS.find(l => l.id === state.currentLessonId);
        const maxSteps = lesson?.steps.length ?? 0;
        
        // Boundary check: if we're already at the last step, return false
        if (state.currentStepIndex >= maxSteps - 1 || maxSteps === 0) {
          return false;
        }
        
        set({ currentStepIndex: state.currentStepIndex + 1 });
        return true;
      },

      prevStep: () => {
        const state = get();
        if (state.currentStepIndex > 0) {
          set({ currentStepIndex: state.currentStepIndex - 1 });
          return true;
        }
        return false;
      },

      completeLesson: () => {
        const state = get();
        if (!state.currentLessonId) return;
        
        const completedLessons = state.progress.completedLessons.includes(state.currentLessonId)
          ? state.progress.completedLessons
          : [...state.progress.completedLessons, state.currentLessonId];
        
        set({
          lessonCompleted: true,
          progress: {
            ...state.progress,
            completedLessons,
          },
        });
        
        // Check for badge unlocks
        get().checkAndUnlockBadges();
      },

      exitLesson: () => set({
        activeMode: 'menu',
        currentLessonId: null,
        currentStepIndex: 0,
        lessonCompleted: false,
      }),

      // Quiz actions
      startQuiz: (questionIds) => set({
        activeMode: 'quiz',
        currentQuiz: {
          id: Date.now().toString(),
          startedAt: new Date(),
          questions: questionIds,
          currentIndex: 0,
          results: [],
          totalScore: 0,
        },
        quizStreak: 0,
      }),

      submitAnswer: (isCorrect, xpReward, timeSpent) => {
        const state = get();
        if (!state.currentQuiz) return;
        
        const questionId = state.currentQuiz.questions[state.currentQuiz.currentIndex];
        const xpEarned = isCorrect ? xpReward : 0;
        
        const result: QuizResult = {
          questionId,
          answeredAt: new Date(),
          isCorrect,
          timeSpent,
          xpEarned,
        };
        
        set({
          currentQuiz: {
            ...state.currentQuiz,
            results: [...state.currentQuiz.results, result],
            totalScore: state.currentQuiz.totalScore + xpEarned,
          },
        });
        
        // Update streak and XP
        get().updateStreak(isCorrect);
        if (isCorrect) {
          get().awardXP(xpReward);
        }
      },

      nextQuestion: () => {
        const state = get();
        if (!state.currentQuiz) return false;
        
        const nextIndex = state.currentQuiz.currentIndex + 1;
        if (nextIndex < state.currentQuiz.questions.length) {
          set({
            currentQuiz: {
              ...state.currentQuiz,
              currentIndex: nextIndex,
            },
          });
          return true;
        }
        return false;
      },

      endQuiz: () => {
        const state = get();
        if (!state.currentQuiz) return;
        
        // Check if perfect quiz
        const allCorrect = state.currentQuiz.results.every(r => r.isCorrect);
        if (allCorrect && state.currentQuiz.results.length > 0) {
          // Will be handled in checkAndUnlockBadges
        }
        
        set({
          activeMode: 'results',
          progress: {
            ...state.progress,
            quizHistory: [...state.progress.quizHistory, ...state.currentQuiz.results],
          },
        });
        
        get().checkAndUnlockBadges();
      },

      // Progress actions
      awardXP: (points) => set((state) => ({
        progress: {
          ...state.progress,
          xpPoints: state.progress.xpPoints + points,
          level: calculateLevel(state.progress.xpPoints + points),
        },
      })),

      updateStreak: (correct) => {
        const state = get();
        const newStreak = correct ? state.quizStreak + 1 : 0;
        const maxStreak = Math.max(newStreak, state.progress.streak);
        
        set({
          quizStreak: newStreak,
          progress: {
            ...state.progress,
            streak: maxStreak,
          },
        });
      },

      checkAndUnlockBadges: () => {
        const state = get();
        const unlockedBadges: Badge[] = [];
        const now = new Date().toISOString();
        
        const currentBadgeIds = state.progress.badges.map(b => b.id);
        
        for (const badge of AVAILABLE_BADGES) {
          if (currentBadgeIds.includes(badge.id)) continue;
          
          let shouldUnlock = false;
          
          switch (badge.condition.type) {
            case 'first_lesson':
              shouldUnlock = state.progress.completedLessons.length >= 1;
              break;
            case 'streak_count':
              shouldUnlock = state.progress.streak >= badge.condition.value;
              break;
            case 'xp_threshold':
              shouldUnlock = state.progress.xpPoints >= badge.condition.value;
              break;
            case 'lessons_completed':
              shouldUnlock = state.progress.completedLessons.length >= badge.condition.value;
              break;
            case 'quizzes_completed':
              shouldUnlock = state.progress.completedQuizzes.length >= badge.condition.value;
              break;
            case 'perfect_quiz':
              if (state.currentQuiz) {
                const allCorrect = state.currentQuiz.results.every(r => r.isCorrect);
                shouldUnlock = allCorrect && state.currentQuiz.results.length > 0;
              }
              break;
          }
          
          if (shouldUnlock) {
            const newBadge = { ...badge, unlockedAt: now };
            unlockedBadges.push(newBadge);
          }
        }
        
        if (unlockedBadges.length > 0) {
          set({
            progress: {
              ...state.progress,
              badges: [...state.progress.badges, ...unlockedBadges],
            },
          });
        }
        
        return unlockedBadges;
      },

      // Getters
      getCurrentLevel: () => {
        const state = get();
        return calculateLevel(state.progress.xpPoints);
      },

      getXPForNextLevel: () => {
        const state = get();
        const currentLevel = calculateLevel(state.progress.xpPoints);
        const xpForNextLevel = currentLevel * XP_PER_LEVEL;
        return xpForNextLevel - state.progress.xpPoints;
      },

      hasCompletedLesson: (lessonId) => {
        const state = get();
        return state.progress.completedLessons.includes(lessonId);
      },

      getBadgeById: (badgeId) => {
        const state = get();
        return state.progress.badges.find(b => b.id === badgeId);
      },
    }),
    {
      name: 'education-storage',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        progress: state.progress,
      }),
    }
  )
);


