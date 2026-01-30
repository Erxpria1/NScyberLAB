// Lesson: Simple Beam Reactions (Basit Kiriş Tepkileri)
import type { Lesson, QuizQuestion } from '@/types/education';

export const simpleBeamLesson: Lesson = {
  id: 'simple-beam-reactions',
  title: 'Simple Beam Reactions',
  titleTR: 'Basit Kiriş Tepkileri',
  description: 'Learn how to calculate support reactions for simply supported beams',
  descriptionTR: 'Basit mesnetli kirişlerde mesnet tepkilerini hesaplamayı öğren',
  difficulty: 'beginner',
  estimatedMinutes: 15,
  requiredXP: 0,
  steps: [
    // Step 1: Introduction
    {
      id: 'step-1-intro',
      type: 'theory',
      title: 'Introduction',
      titleTR: 'Giriş',
      content: {
        textTR: `# Mesnet Tepkileri Nedir?

Bir kiriş üzerine yükler (kuvvetler) etki ettiğinde, kirişi tutan mesnetler karşı kuvvetler oluşturur. Bu karşı kuvvetlere **mesnet tepkileri** denir.

## Neden Önemli?
- Yapının dengede kalması için gerekli
- Mesnet tasarımı için kritik
- Moment ve kesme kuvveti hesaplarının temeli

## Bu Derste Öğreneceklerin:
1. Serbest cisim diyagramı çizimi
2. Denge denklemlerinin uygulanması
3. Tepki kuvvetlerinin hesaplanması`,
      },
    },
    // Step 2: Equilibrium Equations
    {
      id: 'step-2-equilibrium',
      type: 'formula',
      title: 'Equilibrium Equations',
      titleTR: 'Denge Denklemleri',
      content: {
        formula: `\\sum F_x = 0 \\quad \\text{(Yatay Denge)}`,
        explanationTR: `Bir cisim dengede olması için üç koşul sağlanmalıdır:

**1. Yatay Kuvvetler Dengesi:** Tüm yatay kuvvetlerin toplamı sıfır olmalı.

**2. Düşey Kuvvetler Dengesi:** Tüm düşey kuvvetlerin toplamı sıfır olmalı.

**3. Moment Dengesi:** Herhangi bir noktaya göre momentlerin toplamı sıfır olmalı.`,
      },
    },
    // Step 3: Equilibrium Equations Part 2
    {
      id: 'step-3-equilibrium-2',
      type: 'formula',
      title: 'Vertical Equilibrium',
      titleTR: 'Düşey Denge',
      content: {
        formula: `\\sum F_y = 0 \\quad \\text{ve} \\quad \\sum M = 0`,
        explanationTR: `Bu üç denklem ile 3 bilinmeyen çözülebilir.

Basit mesnetli bir kirişte:
- **Sabit Mesnet (Pin):** Hem yatay hem düşey tepki verir (2 bilinmeyen)
- **Hareketli Mesnet (Roller):** Sadece düşey tepki verir (1 bilinmeyen)

Toplam: 3 bilinmeyen = 3 denklem ✓`,
      },
    },
    // Step 4: Visual Example
    {
      id: 'step-4-visual',
      type: 'visualization',
      title: 'Free Body Diagram',
      titleTR: 'Serbest Cisim Diyagramı',
      content: {
        textTR: `Aşağıdaki örnekte 6m uzunluğunda bir kiriş üzerinde 10 kN'luk tekil yük uygulanmıştır.`,
        beamConfig: {
          length: 6,
          supports: [
            { type: 'pin', position: 0, label: 'A' },
            { type: 'roller', position: 6, label: 'B' },
          ],
          loads: [
            { type: 'point', position: 2, magnitude: 10, label: 'P = 10 kN' },
          ],
        },
      },
    },
    // Step 5: Solution Step 1
    {
      id: 'step-5-solution-1',
      type: 'formula',
      title: 'Step 1: Moment Equation',
      titleTR: 'Adım 1: Moment Denklemi',
      content: {
        formula: `\\sum M_A = 0`,
        explanationTR: `A noktasına göre moment alıyoruz:

**Dikkat:** Saat yönü tersine (+), saat yönünde (-)

$R_B \\times 6 - 10 \\times 2 = 0$

$R_B = \\frac{20}{6} = 3.33 \\text{ kN}$`,
      },
    },
    // Step 6: Solution Step 2
    {
      id: 'step-6-solution-2',
      type: 'formula',
      title: 'Step 2: Vertical Equilibrium',
      titleTR: 'Adım 2: Düşey Denge',
      content: {
        formula: `\\sum F_y = 0`,
        explanationTR: `Düşey kuvvetler dengesi:

$R_A + R_B - 10 = 0$

$R_A = 10 - 3.33 = 6.67 \\text{ kN}$

**Sonuç:**
- $R_A = 6.67$ kN (↑)
- $R_B = 3.33$ kN (↑)`,
      },
    },
    // Step 7: Interactive Quiz
    {
      id: 'step-7-quiz',
      type: 'quiz',
      title: 'Quick Check',
      titleTR: 'Hızlı Kontrol',
      content: {
        question: {
          id: 'q-simple-beam-1',
          type: 'multiple_choice',
          question: 'If the load P was at the center (3m from A), what would RA be?',
          questionTR: 'Yük P ortada olsaydı (A\'dan 3m), RA ne olurdu?',
          options: [
            { id: 'a', text: '3.33 kN', isCorrect: false },
            { id: 'b', text: '5 kN', textTR: '5 kN', isCorrect: true },
            { id: 'c', text: '6.67 kN', isCorrect: false },
            { id: 'd', text: '10 kN', isCorrect: false },
          ],
          xpReward: 10,
          timeLimit: 30,
          hintTR: 'Ortada yük varsa tepkiler eşit olur.',
          explanationTR: 'Yük ortada olduğunda simetri gereği her iki mesnet eşit tepki verir: RA = RB = P/2 = 5 kN',
        },
      },
    },
    // Step 8: Summary
    {
      id: 'step-8-summary',
      type: 'theory',
      title: 'Summary',
      titleTR: 'Özet',
      content: {
        textTR: `# Öğrendiklerimiz ✓

## Temel Adımlar:
1. **Serbest cisim diyagramı** çiz
2. **Denge denklemlerini** yaz
3. **Moment** denkleminden başla (bilinmeyen elemine et)
4. **Düşey denge** ile diğer tepkiyi bul

## Formüller:
- $\\sum F_x = 0$
- $\\sum F_y = 0$  
- $\\sum M = 0$

## Sonraki Ders:
Kesme Kuvveti Diyagramları 📈

---
**Tebrikler!** İlk dersini tamamladın! 🎉`,
      },
    },
  ],
};

// Quiz questions for this lesson
export const simpleBeamQuizQuestions: QuizQuestion[] = [
  {
    id: 'quiz-sb-1',
    type: 'numeric',
    question: 'A 10m beam has a pin support at A (left) and roller at B (right). A 20kN load is applied 4m from A. Calculate RB.',
    questionTR: '10m\'lik kirişin A noktasında sabit, B noktasında hareketli mesnet var. 20kN yük A\'dan 4m uzaklıkta. RB\'yi hesapla.',
    correctAnswer: 8,
    tolerance: 0.1,
    unit: 'kN',
    xpReward: 15,
    timeLimit: 60,
    explanationTR: 'ΣMA = 0: RB × 10 - 20 × 4 = 0, RB = 80/10 = 8 kN',
  },
  {
    id: 'quiz-sb-2',
    type: 'multiple_choice',
    question: 'Which equation should you use FIRST when solving beam reactions?',
    questionTR: 'Kiriş tepkilerini çözerken HANGİ denklemi ÖNCE kullanmalısın?',
    options: [
      { id: 'a', text: 'ΣFx = 0', isCorrect: false },
      { id: 'b', text: 'ΣFy = 0', isCorrect: false },
      { id: 'c', text: 'ΣM = 0', isCorrect: true },
      { id: 'd', text: 'Any order works', textTR: 'Sırası önemli değil', isCorrect: false },
    ],
    xpReward: 10,
    timeLimit: 20,
    explanationTR: 'Moment denklemi bir bilinmeyeni doğrudan elemine eder, bu yüzden önce kullanılır.',
  },
  {
    id: 'quiz-sb-3',
    type: 'true_false',
    question: 'A roller support can provide horizontal reaction force.',
    questionTR: 'Hareketli mesnet yatay tepki kuvveti sağlayabilir.',
    correctBoolean: false,
    xpReward: 5,
    timeLimit: 15,
    explanationTR: 'Hareketli mesnet sadece düşey tepki sağlar, yatayda serbestçe hareket eder.',
  },
  {
    id: 'quiz-sb-4',
    type: 'numeric',
    question: 'A 8m cantilever beam has a 15kN point load at the free end. What is the reaction moment at the fixed support?',
    questionTR: '8m konsol kirişin serbest ucunda 15kN yük var. Ankastre mesnetteki tepki momenti nedir?',
    correctAnswer: 120,
    tolerance: 0.5,
    unit: 'kNm',
    xpReward: 20,
    timeLimit: 45,
    explanationTR: 'M = P × L = 15 × 8 = 120 kNm',
  },
];
