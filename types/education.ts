// Education Module Type Definitions for BEAM Education Mode

// ============================================================================
// LESSON TYPES
// ============================================================================

export interface Lesson {
  id: string;
  title: string;
  titleTR: string; // Turkish title
  description: string;
  descriptionTR: string;
  steps: LessonStep[];
  requiredXP?: number;
  estimatedMinutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export type StepType = 'theory' | 'visualization' | 'formula' | 'interactive' | 'quiz';

export interface LessonStep {
  id: string;
  type: StepType;
  title: string;
  titleTR: string;
  content: StepContent;
}

export interface StepContent {
  // For theory steps
  text?: string;
  textTR?: string;
  
  // For visualization steps
  beamConfig?: BeamVisualConfig;
  animation?: AnimationConfig;
  
  // For formula steps
  formula?: string; // LaTeX format
  explanation?: string;
  explanationTR?: string;
  
  // For quiz steps (inline)
  question?: QuizQuestion;
}

export interface BeamVisualConfig {
  length: number;
  supports: VisualSupport[];
  loads: VisualLoad[];
  highlightedElements?: string[];
}

export interface VisualSupport {
  type: 'pin' | 'roller' | 'fixed';
  position: number;
  label?: string;
}

export interface VisualLoad {
  type: 'point' | 'distributed' | 'moment';
  position: number;
  endPosition?: number; // For distributed loads
  magnitude: number;
  label?: string;
}

export interface AnimationConfig {
  type: 'draw' | 'highlight' | 'calculate' | 'result';
  duration: number;
  sequence?: AnimationStep[];
}

export interface AnimationStep {
  element: string;
  action: 'show' | 'hide' | 'highlight' | 'animate';
  delay?: number;
}

// ============================================================================
// QUIZ TYPES
// ============================================================================

export type QuizQuestionType = 'multiple_choice' | 'numeric' | 'diagram_match' | 'true_false';

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  question: string;
  questionTR: string;
  
  // For multiple choice
  options?: QuizOption[];
  
  // For numeric
  correctAnswer?: number;
  tolerance?: number; // For numeric answers (e.g., ±0.01)
  unit?: string;
  
  // For diagram match
  diagramOptions?: BeamVisualConfig[];
  correctDiagramIndex?: number;
  
  // For true/false
  correctBoolean?: boolean;
  
  // Common
  xpReward: number;
  timeLimit?: number; // seconds
  hint?: string;
  hintTR?: string;
  explanation?: string;
  explanationTR?: string;
}

export interface QuizOption {
  id: string;
  text: string;
  textTR?: string;
  isCorrect: boolean;
}

export interface QuizResult {
  questionId: string;
  answeredAt: Date;
  isCorrect: boolean;
  timeSpent: number; // seconds
  xpEarned: number;
}

export interface QuizSession {
  id: string;
  startedAt: Date;
  questions: string[]; // question IDs
  currentIndex: number;
  results: QuizResult[];
  totalScore: number;
}

// ============================================================================
// PROGRESS & GAMIFICATION TYPES
// ============================================================================

export interface UserProgress {
  xpPoints: number;
  level: number;
  streak: number;
  lastActivityDate: string; // ISO date string
  completedLessons: string[];
  completedQuizzes: string[];
  badges: Badge[];
  quizHistory: QuizResult[];
}

export interface Badge {
  id: string;
  name: string;
  nameTR: string;
  description: string;
  descriptionTR: string;
  icon: string; // emoji or icon name
  condition: BadgeCondition;
  unlockedAt?: string; // ISO date string
}

export type BadgeCondition = 
  | { type: 'xp_threshold'; value: number }
  | { type: 'streak_count'; value: number }
  | { type: 'lessons_completed'; value: number }
  | { type: 'quizzes_completed'; value: number }
  | { type: 'perfect_quiz' }
  | { type: 'first_lesson' };

// ============================================================================
// EDUCATION STATE TYPES
// ============================================================================

export type EducationMode = 'menu' | 'lesson' | 'quiz' | 'results';

export interface EducationState {
  // Navigation
  activeMode: EducationMode;
  
  // Lesson state
  currentLessonId: string | null;
  currentStepIndex: number;
  lessonCompleted: boolean;
  
  // Quiz state
  currentQuiz: QuizSession | null;
  
  // User progress (persisted)
  progress: UserProgress;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_USER_PROGRESS: UserProgress = {
  xpPoints: 0,
  level: 1,
  streak: 0,
  lastActivityDate: new Date().toISOString().split('T')[0],
  completedLessons: [],
  completedQuizzes: [],
  badges: [],
  quizHistory: [],
};

// XP required for each level
export const XP_PER_LEVEL = 100;

// Calculate level from XP
export function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

// Built-in badges
export const AVAILABLE_BADGES: Badge[] = [
  {
    id: 'first_lesson',
    name: 'First Steps',
    nameTR: 'İlk Adım',
    description: 'Complete your first lesson',
    descriptionTR: 'İlk dersini tamamla',
    icon: '🔰',
    condition: { type: 'first_lesson' },
  },
  {
    id: 'streak_5',
    name: 'On Fire',
    nameTR: 'Ateşte',
    description: 'Get 5 correct answers in a row',
    descriptionTR: '5 soruyu üst üste doğru cevapla',
    icon: '🔥',
    condition: { type: 'streak_count', value: 5 },
  },
  {
    id: 'xp_100',
    name: 'Century',
    nameTR: 'Yüzlük',
    description: 'Earn 100 XP',
    descriptionTR: '100 XP kazan',
    icon: '💯',
    condition: { type: 'xp_threshold', value: 100 },
  },
  {
    id: 'perfect_quiz',
    name: 'Perfect Score',
    nameTR: 'Mükemmel Skor',
    description: 'Get all questions right in a quiz',
    descriptionTR: 'Bir quizde tüm soruları doğru cevapla',
    icon: '⭐',
    condition: { type: 'perfect_quiz' },
  },
  {
    id: 'engineer',
    name: 'Engineer',
    nameTR: 'Mühendis',
    description: 'Complete 5 lessons',
    descriptionTR: '5 dersi tamamla',
    icon: '📐',
    condition: { type: 'lessons_completed', value: 5 },
  },
];
