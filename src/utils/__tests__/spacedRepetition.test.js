import { SpacedRepetitionManager } from '../spacedRepetition';

describe('SpacedRepetitionManager', () => {
  let srManager;

  beforeEach(() => {
    srManager = new SpacedRepetitionManager();
  });

  test('should calculate correct interval for wrong answer', () => {
    const result = srManager.calculateNextReview('q1', 0, 10, 2.5);
    expect(result.interval).toBe(1);
    expect(result.easeFactor).toBe(2.3); // 2.5 - 0.2
  });

  test('should calculate correct interval for correct answer', () => {
    const result = srManager.calculateNextReview('q1', 2, 1, 2.5);
    expect(result.interval).toBe(6);
    expect(result.easeFactor).toBe(2.5);
  });

  test('should handle easy answers correctly', () => {
    const result = srManager.calculateNextReview('q1', 3, 6, 2.5);
    expect(result.interval).toBeGreaterThan(6);
    expect(result.easeFactor).toBe(2.65); // 2.5 + 0.15
  });

  test('should filter questions due for review', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const reviewData = [
      { questionId: 'q1', nextReviewDate: pastDate.toISOString() },
      { questionId: 'q2', nextReviewDate: futureDate.toISOString() }
    ];

    const dueQuestions = srManager.getQuestionsForReview(reviewData);
    expect(dueQuestions).toHaveLength(1);
    expect(dueQuestions[0].questionId).toBe('q1');
  });
});
