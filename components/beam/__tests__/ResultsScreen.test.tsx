import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ResultsScreen } from '../ResultsScreen';
import { useEducationStore } from '@/store/useEducationStore';

// Mock the store
jest.mock('@/store/useEducationStore');
const mockedUseEducationStore = useEducationStore as jest.MockedFunction<typeof useEducationStore>;

// Mock theme
jest.mock('@/utils/theme', () => ({
  Colors: {
    gray: (n: number) => `#gray${n}`,
    amber: { primary: '#FFB000', secondary: '#FFD700', dim: '#8B6914', glow: '#FFD70080' },
    black: '#000000',
    white: '#ffffff',
    ide: {
      bg: '#0a0a0a',
      yellow: '#ffb000',
      accent: '#007acc',
      header: '#1e1e1e',
      selection: '#264f78',
      toolWindow: '#252526',
      border: 'rgba(255, 184, 0, 0.1)',
      mint: '#00ff00',
      pink: '#FF69B4',
    },
    status: { success: '#4caf50', error: '#f44336', warning: '#ff9800' },
  },
  Typography: {
    family: { mono: 'Courier' },
    sizes: { xs: 10, sm: 12, md: 14, lg: 16, xl: 20 },
  },
  Spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 },
  Shapes: { borderWidth: { brutal: 2 } },
  Effects: { scanline: 1 },
}));

describe('ResultsScreen', () => {
  const mockGoToMenu = jest.fn();

  const mockProgress = {
    xpPoints: 250,
    level: 3,
    streak: 5,
    lastActivityDate: new Date().toISOString(),
    completedLessons: ['lesson-1'],
    completedQuizzes: [],
    badges: ['first_lesson'],
    quizHistory: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders error when no currentQuiz', () => {
    mockedUseEducationStore.mockReturnValue({
      currentQuiz: null,
      progress: mockProgress,
      goToMenu: mockGoToMenu,
    } as any);

    const { getByText } = render(<ResultsScreen />);

    expect(getByText('Sonuç bulunamadı')).toBeTruthy();
    expect(getByText('MENÜYE DÖN')).toBeTruthy();
  });

  it('calls goToMenu when menu button pressed on error screen', () => {
    mockedUseEducationStore.mockReturnValue({
      currentQuiz: null,
      progress: mockProgress,
      goToMenu: mockGoToMenu,
    } as any);

    const { getByText } = render(<ResultsScreen />);
    fireEvent.press(getByText('MENÜYE DÖN'));

    expect(mockGoToMenu).toHaveBeenCalled();
  });

  it('displays grade A for 90%+ accuracy', () => {
    mockedUseEducationStore.mockReturnValue({
      currentQuiz: {
        id: 'quiz1',
        startedAt: new Date(),
        questions: ['q1', 'q2', 'q3'],
        currentIndex: 3,
        results: [
          { questionId: 'q1', answeredAt: new Date(), isCorrect: true, timeSpent: 10, xpEarned: 10 },
          { questionId: 'q2', answeredAt: new Date(), isCorrect: true, timeSpent: 15, xpEarned: 10 },
          { questionId: 'q3', answeredAt: new Date(), isCorrect: true, timeSpent: 12, xpEarned: 10 },
        ],
        totalScore: 30,
      },
      progress: mockProgress,
      goToMenu: mockGoToMenu,
    } as any);

    const { getByText } = render(<ResultsScreen />);

    expect(getByText('A')).toBeTruthy();
    // Grade subtext displays the message, but we're primarily checking the grade letter
  });

  it('displays grade B for 70-89% accuracy', () => {
    mockedUseEducationStore.mockReturnValue({
      currentQuiz: {
        id: 'quiz1',
        startedAt: new Date(),
        questions: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'],
        currentIndex: 10,
        results: [
          { questionId: 'q1', answeredAt: new Date(), isCorrect: true, timeSpent: 10, xpEarned: 10 },
          { questionId: 'q2', answeredAt: new Date(), isCorrect: true, timeSpent: 15, xpEarned: 10 },
          { questionId: 'q3', answeredAt: new Date(), isCorrect: true, timeSpent: 12, xpEarned: 10 },
          { questionId: 'q4', answeredAt: new Date(), isCorrect: true, timeSpent: 11, xpEarned: 10 },
          { questionId: 'q5', answeredAt: new Date(), isCorrect: true, timeSpent: 13, xpEarned: 10 },
          { questionId: 'q6', answeredAt: new Date(), isCorrect: true, timeSpent: 14, xpEarned: 10 },
          { questionId: 'q7', answeredAt: new Date(), isCorrect: true, timeSpent: 10, xpEarned: 10 },
          { questionId: 'q8', answeredAt: new Date(), isCorrect: true, timeSpent: 15, xpEarned: 10 },
          { questionId: 'q9', answeredAt: new Date(), isCorrect: false, timeSpent: 12, xpEarned: 0 },
          { questionId: 'q10', answeredAt: new Date(), isCorrect: false, timeSpent: 11, xpEarned: 0 },
        ],
        totalScore: 80,
      },
      progress: mockProgress,
      goToMenu: mockGoToMenu,
    } as any);

    const { getByText } = render(<ResultsScreen />);

    expect(getByText('B')).toBeTruthy();
    // Grade subtext displays the message, but we're primarily checking the grade letter
  });

  it('displays grade C for 50-69% accuracy', () => {
    mockedUseEducationStore.mockReturnValue({
      currentQuiz: {
        id: 'quiz1',
        startedAt: new Date(),
        questions: ['q1', 'q2', 'q3', 'q4'],
        currentIndex: 4,
        results: [
          { questionId: 'q1', answeredAt: new Date(), isCorrect: true, timeSpent: 10, xpEarned: 10 },
          { questionId: 'q2', answeredAt: new Date(), isCorrect: true, timeSpent: 15, xpEarned: 10 },
          { questionId: 'q3', answeredAt: new Date(), isCorrect: false, timeSpent: 12, xpEarned: 0 },
          { questionId: 'q4', answeredAt: new Date(), isCorrect: false, timeSpent: 8, xpEarned: 0 },
        ],
        totalScore: 20,
      },
      progress: mockProgress,
      goToMenu: mockGoToMenu,
    } as any);

    const { getByText } = render(<ResultsScreen />);

    expect(getByText('C')).toBeTruthy();
    // Grade subtext displays the message, but we're primarily checking the grade letter
  });

  it('displays grade D for <50% accuracy', () => {
    mockedUseEducationStore.mockReturnValue({
      currentQuiz: {
        id: 'quiz1',
        startedAt: new Date(),
        questions: ['q1', 'q2', 'q3'],
        currentIndex: 3,
        results: [
          { questionId: 'q1', answeredAt: new Date(), isCorrect: true, timeSpent: 10, xpEarned: 10 },
          { questionId: 'q2', answeredAt: new Date(), isCorrect: false, timeSpent: 15, xpEarned: 0 },
          { questionId: 'q3', answeredAt: new Date(), isCorrect: false, timeSpent: 12, xpEarned: 0 },
        ],
        totalScore: 10,
      },
      progress: mockProgress,
      goToMenu: mockGoToMenu,
    } as any);

    const { getByText } = render(<ResultsScreen />);

    expect(getByText('D')).toBeTruthy();
    // Grade subtext displays the message, but we're primarily checking the grade letter
  });

  it('displays correct count', () => {
    mockedUseEducationStore.mockReturnValue({
      currentQuiz: {
        id: 'quiz1',
        startedAt: new Date(),
        questions: ['q1', 'q2', 'q3'],
        currentIndex: 3,
        results: [
          { questionId: 'q1', answeredAt: new Date(), isCorrect: true, timeSpent: 10, xpEarned: 10 },
          { questionId: 'q2', answeredAt: new Date(), isCorrect: true, timeSpent: 15, xpEarned: 10 },
          { questionId: 'q3', answeredAt: new Date(), isCorrect: false, timeSpent: 12, xpEarned: 0 },
        ],
        totalScore: 20,
      },
      progress: mockProgress,
      goToMenu: mockGoToMenu,
    } as any);

    const { getByText } = render(<ResultsScreen />);

    expect(getByText('2/3')).toBeTruthy();
  });

  it('displays accuracy percentage', () => {
    mockedUseEducationStore.mockReturnValue({
      currentQuiz: {
        id: 'quiz1',
        startedAt: new Date(),
        questions: ['q1', 'q2', 'q3', 'q4'],
        currentIndex: 4,
        results: [
          { questionId: 'q1', answeredAt: new Date(), isCorrect: true, timeSpent: 10, xpEarned: 10 },
          { questionId: 'q2', answeredAt: new Date(), isCorrect: true, timeSpent: 15, xpEarned: 10 },
          { questionId: 'q3', answeredAt: new Date(), isCorrect: true, timeSpent: 12, xpEarned: 10 },
          { questionId: 'q4', answeredAt: new Date(), isCorrect: false, timeSpent: 8, xpEarned: 0 },
        ],
        totalScore: 30,
      },
      progress: mockProgress,
      goToMenu: mockGoToMenu,
    } as any);

    const { getByText } = render(<ResultsScreen />);

    expect(getByText('75%')).toBeTruthy();
  });

  it('displays total XP gained', () => {
    mockedUseEducationStore.mockReturnValue({
      currentQuiz: {
        id: 'quiz1',
        startedAt: new Date(),
        questions: ['q1', 'q2', 'q3'],
        currentIndex: 3,
        results: [
          { questionId: 'q1', answeredAt: new Date(), isCorrect: true, timeSpent: 10, xpEarned: 15 },
          { questionId: 'q2', answeredAt: new Date(), isCorrect: true, timeSpent: 15, xpEarned: 20 },
          { questionId: 'q3', answeredAt: new Date(), isCorrect: true, timeSpent: 12, xpEarned: 10 },
        ],
        totalScore: 45,
      },
      progress: mockProgress,
      goToMenu: mockGoToMenu,
    } as any);

    const { getByText } = render(<ResultsScreen />);

    expect(getByText('+45')).toBeTruthy();
  });

  it('displays question breakdown with correct status', () => {
    mockedUseEducationStore.mockReturnValue({
      currentQuiz: {
        id: 'quiz1',
        startedAt: new Date(),
        questions: ['q1', 'q2'],
        currentIndex: 2,
        results: [
          { questionId: 'q1', answeredAt: new Date(), isCorrect: true, timeSpent: 10, xpEarned: 10 },
          { questionId: 'q2', answeredAt: new Date(), isCorrect: false, timeSpent: 15, xpEarned: 0 },
        ],
        totalScore: 10,
      },
      progress: mockProgress,
      goToMenu: mockGoToMenu,
    } as any);

    const { getByText } = render(<ResultsScreen />);

    expect(getByText('#1')).toBeTruthy();
    expect(getByText('✓ STABLE')).toBeTruthy();
    expect(getByText('#2')).toBeTruthy();
    expect(getByText('✗ FAILED')).toBeTruthy();
  });

  it('displays XP earned per question', () => {
    mockedUseEducationStore.mockReturnValue({
      currentQuiz: {
        id: 'quiz1',
        startedAt: new Date(),
        questions: ['q1', 'q2'],
        currentIndex: 2,
        results: [
          { questionId: 'q1', answeredAt: new Date(), isCorrect: true, timeSpent: 10, xpEarned: 15 },
          { questionId: 'q2', answeredAt: new Date(), isCorrect: true, timeSpent: 15, xpEarned: 25 },
        ],
        totalScore: 40,
      },
      progress: mockProgress,
      goToMenu: mockGoToMenu,
    } as any);

    const { getByText } = render(<ResultsScreen />);

    expect(getByText('+15P')).toBeTruthy();
    expect(getByText('+25P')).toBeTruthy();
  });

  it('displays total XP from progress', () => {
    mockedUseEducationStore.mockReturnValue({
      currentQuiz: {
        id: 'quiz1',
        startedAt: new Date(),
        questions: ['q1'],
        currentIndex: 1,
        results: [
          { questionId: 'q1', answeredAt: new Date(), isCorrect: true, timeSpent: 10, xpEarned: 10 },
        ],
        totalScore: 10,
      },
      progress: mockProgress,
      goToMenu: mockGoToMenu,
    } as any);

    const { getByText } = render(<ResultsScreen />);

    expect(getByText('250')).toBeTruthy(); // Total XP from progress
  });

  it('displays streak from progress', () => {
    mockedUseEducationStore.mockReturnValue({
      currentQuiz: {
        id: 'quiz1',
        startedAt: new Date(),
        questions: ['q1'],
        currentIndex: 1,
        results: [
          { questionId: 'q1', answeredAt: new Date(), isCorrect: true, timeSpent: 10, xpEarned: 10 },
        ],
        totalScore: 10,
      },
      progress: mockProgress,
      goToMenu: mockGoToMenu,
    } as any);

    const { getByText } = render(<ResultsScreen />);

    expect(getByText('5 🔥')).toBeTruthy();
  });

  it('displays badges count from progress', () => {
    mockedUseEducationStore.mockReturnValue({
      currentQuiz: {
        id: 'quiz1',
        startedAt: new Date(),
        questions: ['q1'],
        currentIndex: 1,
        results: [
          { questionId: 'q1', answeredAt: new Date(), isCorrect: true, timeSpent: 10, xpEarned: 10 },
        ],
        totalScore: 10,
      },
      progress: mockProgress,
      goToMenu: mockGoToMenu,
    } as any);

    const { getByText } = render(<ResultsScreen />);

    expect(getByText('1')).toBeTruthy(); // badges.length
  });

  it('calls goToMenu when disconnect button pressed', () => {
    mockedUseEducationStore.mockReturnValue({
      currentQuiz: {
        id: 'quiz1',
        startedAt: new Date(),
        questions: ['q1'],
        currentIndex: 1,
        results: [
          { questionId: 'q1', answeredAt: new Date(), isCorrect: true, timeSpent: 10, xpEarned: 10 },
        ],
        totalScore: 10,
      },
      progress: mockProgress,
      goToMenu: mockGoToMenu,
    } as any);

    const { getByText } = render(<ResultsScreen />);
    fireEvent.press(getByText('[ DISCONNECT_SESSION ]'));

    expect(mockGoToMenu).toHaveBeenCalled();
  });

  it('handles zero results gracefully', () => {
    mockedUseEducationStore.mockReturnValue({
      currentQuiz: {
        id: 'quiz1',
        startedAt: new Date(),
        questions: [],
        currentIndex: 0,
        results: [],
        totalScore: 0,
      },
      progress: mockProgress,
      goToMenu: mockGoToMenu,
    } as any);

    const { getByText } = render(<ResultsScreen />);

    expect(getByText('0%')).toBeTruthy();
    expect(getByText('0/0')).toBeTruthy();
  });

  it('shows header title', () => {
    mockedUseEducationStore.mockReturnValue({
      currentQuiz: {
        id: 'quiz1',
        startedAt: new Date(),
        questions: ['q1'],
        currentIndex: 1,
        results: [
          { questionId: 'q1', answeredAt: new Date(), isCorrect: true, timeSpent: 10, xpEarned: 10 },
        ],
        totalScore: 10,
      },
      progress: mockProgress,
      goToMenu: mockGoToMenu,
    } as any);

    const { getByText } = render(<ResultsScreen />);

    expect(getByText('[ SESSION_TERMINATED: REPORT ]')).toBeTruthy();
  });

  it('shows session log section header', () => {
    mockedUseEducationStore.mockReturnValue({
      currentQuiz: {
        id: 'quiz1',
        startedAt: new Date(),
        questions: ['q1'],
        currentIndex: 1,
        results: [
          { questionId: 'q1', answeredAt: new Date(), isCorrect: true, timeSpent: 10, xpEarned: 10 },
        ],
        totalScore: 10,
      },
      progress: mockProgress,
      goToMenu: mockGoToMenu,
    } as any);

    const { getByText } = render(<ResultsScreen />);

    expect(getByText('[ SESSION_MODULE_LOG ]')).toBeTruthy();
  });

  it('shows global storage section header', () => {
    mockedUseEducationStore.mockReturnValue({
      currentQuiz: {
        id: 'quiz1',
        startedAt: new Date(),
        questions: ['q1'],
        currentIndex: 1,
        results: [
          { questionId: 'q1', answeredAt: new Date(), isCorrect: true, timeSpent: 10, xpEarned: 10 },
        ],
        totalScore: 10,
      },
      progress: mockProgress,
      goToMenu: mockGoToMenu,
    } as any);

    const { getByText } = render(<ResultsScreen />);

    expect(getByText('[ GLOBAL_STORAGE: SYNC ]')).toBeTruthy();
  });
});
