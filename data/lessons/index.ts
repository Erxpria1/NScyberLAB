// Lessons Index - Export all lesson content
export { simpleBeamLesson, simpleBeamQuizQuestions } from './simpleBeam';
import { simpleBeamLesson, simpleBeamQuizQuestions } from './simpleBeam';
import type { Lesson, QuizQuestion } from '@/types/education';

// All available lessons
export const ALL_LESSONS: Lesson[] = [
  simpleBeamLesson,
];

// All quiz questions indexed by ID
export const QUIZ_BANK: Record<string, QuizQuestion> = {
  ...simpleBeamQuizQuestions.reduce((acc, q) => ({ ...acc, [q.id]: q }), {}),
};

// Get lesson by ID
export function getLessonById(id: string): Lesson | undefined {
  return ALL_LESSONS.find(lesson => lesson.id === id);
}

// Get quiz question by ID
export function getQuizQuestionById(id: string): QuizQuestion | undefined {
  return QUIZ_BANK[id];
}

// Get random quiz questions
export function getRandomQuizQuestions(count: number, excludeIds: string[] = []): QuizQuestion[] {
  const available = Object.values(QUIZ_BANK).filter(q => !excludeIds.includes(q.id));
  const shuffled = available.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Check if lesson is locked based on XP
export function isLessonLocked(lesson: Lesson, currentXP: number): boolean {
  return lesson.requiredXP !== undefined && lesson.requiredXP > currentXP;
}
