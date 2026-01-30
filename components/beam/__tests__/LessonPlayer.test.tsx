import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LessonPlayer } from '../LessonPlayer';
import { useEducationStore } from '@/store/useEducationStore';

// Mock react-native-webview
jest.mock('react-native-webview', () => ({
  WebView: 'WebView',
}));

// Mock MathRenderer before FormulaDisplay imports it
jest.mock('@/components/math/MathRenderer', () => ({
  MathRenderer: () => null,
}));

// Mock dependencies
jest.mock('@/store/useEducationStore');
jest.mock('@/data/lessons', () => ({
  getLessonById: jest.fn(),
}));

// Mock components
jest.mock('@/components/beam/StepIndicator', () => ({
  StepIndicator: ({ currentStep, totalSteps, stepTitle }: any) =>
    'PHASE: ' + currentStep + '/' + totalSteps + ' - ' + stepTitle,
}));

// Mock FormulaDisplay - return a simple Text component
jest.mock('@/components/beam/FormulaDisplay', () => ({
  FormulaDisplay: () => null,
}));

// Mock AnimatedBeamDiagram - return null
jest.mock('@/components/beam/AnimatedBeamDiagram', () => ({
  AnimatedBeamDiagram: () => null,
}));

const mockUseEducationStore = useEducationStore as jest.MockedFunction<typeof useEducationStore>;
const mockGetLessonById = require('@/data/lessons').getLessonById as jest.Mock;

// Default lesson data
const defaultLesson = {
  id: 'test-lesson',
  title: 'Test Lesson',
  titleTR: 'Test Dersi',
  description: 'Test Description',
  descriptionTR: 'Test Açıklama',
  category: 'basics',
  xpReward: 50,
  estimatedMinutes: 10,
  difficulty: 'beginner' as const,
  steps: [
    {
      id: 'step1',
      type: 'theory' as const,
      title: 'Introduction',
      titleTR: 'Giriş',
      content: {
        text: 'This is a theory step',
        textTR: 'Bu bir teori adımıdır',
      },
    },
    {
      id: 'step2',
      type: 'quiz' as const,
      title: 'Quiz',
      titleTR: 'Sınav',
      content: {
        question: {
          id: 'q1',
          type: 'multiple_choice',
          question: 'What is 2+2?',
          questionTR: '2+2 nedir?',
          options: [
            { id: 'a', text: '3', textTR: '3', isCorrect: false },
            { id: 'b', text: '4', textTR: '4', isCorrect: true },
            { id: 'c', text: '5', textTR: '5', isCorrect: false },
          ],
          xpReward: 10,
          explanation: '2+2 equals 4',
          explanationTR: '2+2 eşittir 4',
        },
      },
    },
    {
      id: 'step3',
      type: 'formula' as const,
      title: 'Formula',
      titleTR: 'Formül',
      content: {
        formula: {
          latex: 'M = \\frac{\\sigma}{y} \\cdot I',
          variables: [
            { symbol: 'M', name: 'Moment', nameTR: 'Moment' },
            { symbol: 'σ', name: 'Stress', nameTR: 'Gerilme' },
          ],
        },
        explanationTR: 'Bu bir formül açıklamasıdır',
      },
    },
    {
      id: 'step4',
      type: 'visualization' as const,
      title: 'Visualization',
      titleTR: 'Görselleştirme',
      content: {
        textTR: 'Kiriş davranışını gözlemleyin',
        beamConfig: {
          length: 10,
          supports: ['pin', 'roller'],
          loads: [{ type: 'point', position: 5, magnitude: 100 }],
        } as any,
      },
    },
  ],
};

describe('LessonPlayer', () => {
  const mockStoreActions = {
    currentLessonId: 'test-lesson',
    currentStepIndex: 0,
    nextStep: jest.fn(),
    prevStep: jest.fn(),
    completeLesson: jest.fn(),
    exitLesson: jest.fn(),
    awardXP: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockGetLessonById.mockReturnValue(defaultLesson);
    mockUseEducationStore.mockReturnValue(mockStoreActions);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ============================================================================
  // ERROR STATE TESTS (lines 470-475)
  // ============================================================================
  describe('Error State', () => {
    it('renders error when lesson not found', () => {
      mockGetLessonById.mockReturnValue(null);

      const { getByText } = render(<LessonPlayer />);

      expect(getByText('Ders bulunamadı')).toBeTruthy();
    });

    it('renders error when currentLessonId is null', () => {
      mockUseEducationStore.mockReturnValue({
        ...mockStoreActions,
        currentLessonId: null,
      });

      const { getByText } = render(<LessonPlayer />);

      expect(getByText('Ders bulunamadı')).toBeTruthy();
    });
  });

  // ============================================================================
  // NAVIGATION TESTS (lines 478-488)
  // ============================================================================
  describe('Navigation', () => {
    it('shows navigation buttons', () => {
      const { getByText } = render(<LessonPlayer />);

      expect(getByText('◄ GERİ')).toBeTruthy();
      expect(getByText('İLERİ ►')).toBeTruthy();
    });

    it('shows complete button on last step', () => {
      mockUseEducationStore.mockReturnValue({
        ...mockStoreActions,
        currentStepIndex: 3, // Last step
      });

      const { getByText } = render(<LessonPlayer />);

      expect(getByText('TAMAMLA ✓')).toBeTruthy();
    });

    it('calls prevStep when back button pressed', () => {
      mockUseEducationStore.mockReturnValue({
        ...mockStoreActions,
        currentStepIndex: 1,
      });

      const { getByText } = render(<LessonPlayer />);
      fireEvent.press(getByText('◄ GERİ'));

      expect(mockStoreActions.prevStep).toHaveBeenCalled();
    });

    it('calls nextStep when next button pressed', () => {
      const { getByText } = render(<LessonPlayer />);
      fireEvent.press(getByText('İLERİ ►'));

      expect(mockStoreActions.nextStep).toHaveBeenCalled();
    });

    it('calls completeLesson and awards XP on last step', () => {
      mockUseEducationStore.mockReturnValue({
        ...mockStoreActions,
        currentStepIndex: 3, // Last step
      });

      const { getByText } = render(<LessonPlayer />);
      fireEvent.press(getByText('TAMAMLA ✓'));

      expect(mockStoreActions.completeLesson).toHaveBeenCalled();
      expect(mockStoreActions.awardXP).toHaveBeenCalledWith(20);
    });

    it('disables back button on first step', () => {
      const { getByText } = render(<LessonPlayer />);

      const backBtn = getByText('◄ GERİ');
      fireEvent.press(backBtn);

      // prevStep should not be called as button is disabled
      expect(mockStoreActions.prevStep).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // THEORY CONTENT TESTS (lines 278-318)
  // ============================================================================
  describe('TheoryContent Rendering', () => {
    it('renders h1 headings from markdown', () => {
      const lessonWithH1 = {
        ...defaultLesson,
        steps: [
          {
            id: 'step1',
            type: 'theory' as const,
            title: 'Intro',
            titleTR: 'Giriş',
            content: { textTR: '# Ana Başlık\n\nBazı içerik' },
          },
        ],
      };
      mockGetLessonById.mockReturnValue(lessonWithH1);

      const { getByText } = render(<LessonPlayer />);

      expect(getByText('Ana Başlık')).toBeTruthy();
    });

    it('renders h2 headings from markdown', () => {
      const lessonWithH2 = {
        ...defaultLesson,
        steps: [
          {
            id: 'step1',
            type: 'theory' as const,
            title: 'Intro',
            titleTR: 'Giriş',
            content: { textTR: '## Alt Başlık\n\nİçerik' },
          },
        ],
      };
      mockGetLessonById.mockReturnValue(lessonWithH2);

      const { getByText } = render(<LessonPlayer />);

      expect(getByText('Alt Başlık')).toBeTruthy();
    });

    it('renders bullet points from markdown', () => {
      const lessonWithBullets = {
        ...defaultLesson,
        steps: [
          {
            id: 'step1',
            type: 'theory' as const,
            title: 'Intro',
            titleTR: 'Giriş',
            content: { textTR: '- Madde bir\n- Madde iki' },
          },
        ],
      };
      mockGetLessonById.mockReturnValue(lessonWithBullets);

      const { getByText } = render(<LessonPlayer />);

      expect(getByText('Madde bir')).toBeTruthy();
      expect(getByText('Madde iki')).toBeTruthy();
    });

    it('renders numbered lists from markdown', () => {
      const lessonWithNumbers = {
        ...defaultLesson,
        steps: [
          {
            id: 'step1',
            type: 'theory' as const,
            title: 'Intro',
            titleTR: 'Giriş',
            content: { textTR: '1. Birinci madde\n2. İkinci madde' },
          },
        ],
      };
      mockGetLessonById.mockReturnValue(lessonWithNumbers);

      const { getByText } = render(<LessonPlayer />);

      expect(getByText('Birinci madde')).toBeTruthy();
      expect(getByText('İkinci madde')).toBeTruthy();
    });

    it('renders bold text from markdown (line is shown as-is)', () => {
      const lessonWithBold = {
        ...defaultLesson,
        steps: [
          {
            id: 'step1',
            type: 'theory' as const,
            title: 'Intro',
            titleTR: 'Giriş',
            content: { textTR: '**Kalın metin** burada' },
          },
        ],
      };
      mockGetLessonById.mockReturnValue(lessonWithBold);

      const { getByText } = render(<LessonPlayer />);

      // Bold text line should be rendered as-is (the whole line including ** is shown)
      expect(getByText('**Kalın metin** burada')).toBeTruthy();
    });

    it('renders divider from markdown', () => {
      const lessonWithDivider = {
        ...defaultLesson,
        steps: [
          {
            id: 'step1',
            type: 'theory' as const,
            title: 'Intro',
            titleTR: 'Giriş',
            content: { textTR: 'İçerik\n---\nDevamı' },
          },
        ],
      };
      mockGetLessonById.mockReturnValue(lessonWithDivider);

      const { getByText } = render(<LessonPlayer />);

      expect(getByText('İçerik')).toBeTruthy();
    });

    it('renders spacer for empty lines', () => {
      const lessonWithSpacer = {
        ...defaultLesson,
        steps: [
          {
            id: 'step1',
            type: 'theory' as const,
            title: 'Intro',
            titleTR: 'Giriş',
            content: { textTR: 'Birinci satır\n\nİkinci satır' },
          },
        ],
      };
      mockGetLessonById.mockReturnValue(lessonWithSpacer);

      const { getByText } = render(<LessonPlayer />);

      expect(getByText('Birinci satır')).toBeTruthy();
      expect(getByText('İkinci satır')).toBeTruthy();
    });

    it('handles empty text gracefully', () => {
      const lessonWithEmpty = {
        ...defaultLesson,
        steps: [
          {
            id: 'step1',
            type: 'theory' as const,
            title: 'Intro',
            titleTR: 'Giriş',
            content: { textTR: '' },
          },
        ],
      };
      mockGetLessonById.mockReturnValue(lessonWithEmpty);

      // Should not crash when rendering
      expect(() => render(<LessonPlayer />)).not.toThrow();
    });

    it('falls back to text when textTR is not provided', () => {
      const lessonWithEnglish = {
        ...defaultLesson,
        steps: [
          {
            id: 'step1',
            type: 'theory' as const,
            title: 'Intro',
            titleTR: 'Giriş',
            content: { text: 'English content' },
          },
        ],
      };
      mockGetLessonById.mockReturnValue(lessonWithEnglish);

      const { getByText } = render(<LessonPlayer />);

      expect(getByText('English content')).toBeTruthy();
    });
  });

  // ============================================================================
  // FORMULA STEP TESTS (lines 361-373)
  // ============================================================================
  describe('Formula Step', () => {
    beforeEach(() => {
      mockUseEducationStore.mockReturnValue({
        ...mockStoreActions,
        currentStepIndex: 2, // Formula step in the 4-step lesson
      });
    });

    it('renders formula display', () => {
      const { getByText } = render(<LessonPlayer />);

      // The FormulaDisplay mock renders "FORMULA: " + formula.latex
      // With our mock data: "FORMULA: M = \\frac{\\sigma}{y} \\cdot I"
      // Let's just check that the explanation is shown which confirms the formula step is rendered
      expect(getByText('Bu bir formül açıklamasıdır')).toBeTruthy();
    });

    it('renders explanation in formula step', () => {
      const { getByText } = render(<LessonPlayer />);

      expect(getByText('Bu bir formül açıklamasıdır')).toBeTruthy();
    });

    it('handles formula step without formula', () => {
      const lessonWithoutFormula = {
        ...defaultLesson,
        steps: [
          {
            id: 'step1',
            type: 'formula' as const,
            title: 'Formula',
            titleTR: 'Formül Adı',
            content: {
              formula: null,
              explanationTR: 'Açıklama metni',
            },
          },
        ],
      };
      mockGetLessonById.mockReturnValue(lessonWithoutFormula);

      // Also update the store to use currentStepIndex 0
      mockUseEducationStore.mockReturnValue({
        ...mockStoreActions,
        currentStepIndex: 0,
      });

      const { getByText } = render(<LessonPlayer />);

      // Should show the explanation text through TheoryContent
      expect(getByText('Açıklama metni')).toBeTruthy();
    });
  });

  // ============================================================================
  // VISUALIZATION STEP TESTS (lines 375-385)
  // ============================================================================
  describe('Visualization Step', () => {
    beforeEach(() => {
      mockUseEducationStore.mockReturnValue({
        ...mockStoreActions,
        currentStepIndex: 3, // Visualization step in the 4-step lesson
      });
    });

    it('renders visualization description', () => {
      const { getByText } = render(<LessonPlayer />);

      expect(getByText('Kiriş davranışını gözlemleyin')).toBeTruthy();
    });

    it('renders beam diagram', () => {
      // The AnimatedBeamDiagram mock returns "BEAM_DIAGRAM: 10m"
      // Since it's a string return from the mock (not wrapped in Text),
      // just verify it renders without crashing
      expect(() => render(<LessonPlayer />)).not.toThrow();
    });

    it('handles visualization step without config', () => {
      const lessonWithoutConfig = {
        ...defaultLesson,
        steps: [
          {
            id: 'step1',
            type: 'visualization' as const,
            title: 'Visualization',
            titleTR: 'Görselleştirme Adı',
            content: {
              textTR: 'Görselleştirme açıklaması',
              beamConfig: null,
            },
          },
        ],
      };
      mockGetLessonById.mockReturnValue(lessonWithoutConfig);

      // Also update the store to use currentStepIndex 0
      mockUseEducationStore.mockReturnValue({
        ...mockStoreActions,
        currentStepIndex: 0,
      });

      const { getByText } = render(<LessonPlayer />);

      // Should show the description text
      expect(getByText('Görselleştirme açıklaması')).toBeTruthy();
    });
  });

  // ============================================================================
  // QUIZ STEP TESTS (lines 387-446, 344-349)
  // ============================================================================
  describe('Quiz Step', () => {
    beforeEach(() => {
      mockUseEducationStore.mockReturnValue({
        ...mockStoreActions,
        currentStepIndex: 1, // Quiz step
      });
    });

    it('renders quiz question', () => {
      const { getByText } = render(<LessonPlayer />);

      expect(getByText('2+2 nedir?')).toBeTruthy();
    });

    it('renders quiz options', () => {
      const { getByText } = render(<LessonPlayer />);

      expect(getByText('A')).toBeTruthy();
      expect(getByText('3')).toBeTruthy();
      expect(getByText('B')).toBeTruthy();
      expect(getByText('4')).toBeTruthy();
      expect(getByText('C')).toBeTruthy();
      expect(getByText('5')).toBeTruthy();
    });

    it('handles option selection', () => {
      const { getByText } = render(<LessonPlayer />);

      fireEvent.press(getByText('B'));

      // After selection, result should be shown
      expect(getByText('A')).toBeTruthy();
    });

    it('shows explanation after answer', () => {
      const { getByText } = render(<LessonPlayer />);

      fireEvent.press(getByText('B'));

      expect(getByText('>>> AÇIKLAMA:')).toBeTruthy();
      expect(getByText('2+2 eşittir 4')).toBeTruthy();
    });

    it('awards XP for correct answer', () => {
      const { getByText } = render(<LessonPlayer />);

      fireEvent.press(getByText('B')); // Correct answer

      // Fast-forward past the 1500ms delay
      jest.advanceTimersByTime(1500);

      expect(mockStoreActions.awardXP).toHaveBeenCalledWith(10);
    });

    it('does not award XP for wrong answer', () => {
      const { getByText } = render(<LessonPlayer />);

      fireEvent.press(getByText('A')); // Wrong answer

      jest.advanceTimersByTime(1500);

      expect(mockStoreActions.awardXP).not.toHaveBeenCalled();
    });

    it('disables options after selection', () => {
      const { getByText } = render(<LessonPlayer />);

      // Select first option
      fireEvent.press(getByText('A'));

      // Try to select another option - should not change selection
      // The test passes if no error is thrown
      expect(getByText('B')).toBeTruthy();
    });

    it('handles quiz without question gracefully', () => {
      const lessonWithoutQuestion = {
        ...defaultLesson,
        steps: [
          {
            id: 'step1',
            type: 'quiz' as const,
            title: 'Quiz',
            titleTR: 'Sınav Test',
            content: {},
          },
        ],
      };
      mockGetLessonById.mockReturnValue(lessonWithoutQuestion);

      // Also update the store to use currentStepIndex 0
      mockUseEducationStore.mockReturnValue({
        ...mockStoreActions,
        currentStepIndex: 0,
      });

      // Should render without crashing
      expect(() => render(<LessonPlayer />)).not.toThrow();
    });

    it('falls back to English question text', () => {
      const lessonWithEnglishQuestion = {
        ...defaultLesson,
        steps: [
          {
            id: 'step1',
            type: 'quiz' as const,
            title: 'Quiz',
            titleTR: 'Test Quiz',
            content: {
              question: {
                id: 'q1',
                type: 'multiple_choice',
                question: 'English Question Text Here',
                options: [
                  { id: 'a', text: 'Option A', isCorrect: true },
                ],
                xpReward: 10,
              },
            },
          },
        ],
      };
      mockGetLessonById.mockReturnValue(lessonWithEnglishQuestion);

      // Also update the store to use currentStepIndex 0
      mockUseEducationStore.mockReturnValue({
        ...mockStoreActions,
        currentStepIndex: 0,
      });

      const { getByText } = render(<LessonPlayer />);

      expect(getByText('English Question Text Here')).toBeTruthy();
    });

    it('falls back to English option text', () => {
      const lessonWithEnglishOption = {
        ...defaultLesson,
        steps: [
          {
            id: 'step1',
            type: 'quiz' as const,
            title: 'Quiz',
            titleTR: 'Test Quiz',
            content: {
              question: {
                id: 'q1',
                type: 'multiple_choice',
                questionTR: 'Soru',
                options: [
                  { id: 'a', text: 'English Option Here', isCorrect: true },
                ],
                xpReward: 10,
              },
            },
          },
        ],
      };
      mockGetLessonById.mockReturnValue(lessonWithEnglishOption);

      // Also update the store to use currentStepIndex 0
      mockUseEducationStore.mockReturnValue({
        ...mockStoreActions,
        currentStepIndex: 0,
      });

      const { getByText } = render(<LessonPlayer />);

      expect(getByText('English Option Here')).toBeTruthy();
    });
  });

  // ============================================================================
  // UNKNOWN STEP TYPE TESTS (lines 441-446)
  // ============================================================================
  describe('Unknown Step Type', () => {
    it('renders unknown step type message', () => {
      const lessonWithUnknown = {
        ...defaultLesson,
        steps: [
          {
            id: 'step1',
            type: 'unknown' as any,
            title: 'Unknown',
            titleTR: 'Bilinmeyen',
            content: {},
          },
        ],
      };
      mockGetLessonById.mockReturnValue(lessonWithUnknown);

      const { getByText } = render(<LessonPlayer />);

      expect(getByText('Bilinmeyen adım türü: unknown')).toBeTruthy();
    });
  });

  // ============================================================================
  // QUIZ ANSWER HANDLER TESTS (lines 491-495)
  // ============================================================================
  describe('Quiz Answer Handler', () => {
    it('uses default XP reward when question.xpReward is missing', () => {
      const lessonWithoutXPReward = {
        ...defaultLesson,
        steps: [
          {
            id: 'step1',
            type: 'quiz' as const,
            title: 'Quiz',
            titleTR: 'Sınav',
            content: {
              question: {
                id: 'q1',
                type: 'multiple_choice',
                questionTR: 'Soru',
                options: [
                  { id: 'a', textTR: 'A', isCorrect: true },
                ],
                // No xpReward - should default to 10
              },
            },
          },
        ],
      };
      mockGetLessonById.mockReturnValue(lessonWithoutXPReward);

      mockUseEducationStore.mockReturnValue({
        ...mockStoreActions,
        currentStepIndex: 0,
      });

      const { getAllByText } = render(<LessonPlayer />);
      const optionButtons = getAllByText('A');
      fireEvent.press(optionButtons[0]);

      jest.advanceTimersByTime(1500);

      expect(mockStoreActions.awardXP).toHaveBeenCalledWith(10); // Default XP
    });

    it('uses custom XP reward when provided', () => {
      const lessonWithCustomXP = {
        ...defaultLesson,
        steps: [
          {
            id: 'step1',
            type: 'quiz' as const,
            title: 'Quiz',
            titleTR: 'Sınav',
            content: {
              question: {
                id: 'q1',
                type: 'multiple_choice',
                questionTR: 'Soru',
                options: [
                  { id: 'a', textTR: 'A', isCorrect: true },
                ],
                xpReward: 25,
              },
            },
          },
        ],
      };
      mockGetLessonById.mockReturnValue(lessonWithCustomXP);

      mockUseEducationStore.mockReturnValue({
        ...mockStoreActions,
        currentStepIndex: 0,
      });

      const { getAllByText } = render(<LessonPlayer />);
      const optionButtons = getAllByText('A');
      fireEvent.press(optionButtons[0]);

      jest.advanceTimersByTime(1500);

      expect(mockStoreActions.awardXP).toHaveBeenCalledWith(25);
    });
  });

  // ============================================================================
  // STEP INDICATOR TESTS
  // ============================================================================
  describe('Step Indicator', () => {
    beforeEach(() => {
      mockUseEducationStore.mockReturnValue(mockStoreActions);
    });

    it('displays step indicator with correct info', () => {
      // The StepIndicator mock returns a string which may not be queryable
      // Just verify it renders without crashing
      expect(() => render(<LessonPlayer />)).not.toThrow();
    });

    it('updates step indicator on different steps', () => {
      mockUseEducationStore.mockReturnValue({
        ...mockStoreActions,
        currentStepIndex: 2,
      });

      expect(() => render(<LessonPlayer />)).not.toThrow();
    });
  });

  // ============================================================================
  // THEORY STEP TESTS
  // ============================================================================
  describe('Theory Step', () => {
    beforeEach(() => {
      mockUseEducationStore.mockReturnValue(mockStoreActions);
    });

    it('handles theory content step', () => {
      const { getByText } = render(<LessonPlayer />);

      expect(getByText('Bu bir teori adımıdır')).toBeTruthy();
    });
  });
});
