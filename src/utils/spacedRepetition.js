// Spaced Repetition Algorithm (SM-2 based)
export class SpacedRepetitionManager {
  constructor() {
    this.intervals = [1, 6]; // Initial intervals in days
    this.easeFactor = 2.5;
    this.minEaseFactor = 1.3;
  }

  // Calculate next review date based on performance
  calculateNextReview(questionId, performance, currentInterval = 1, easeFactor = 2.5) {
    let newInterval;
    let newEaseFactor = easeFactor;

    // Performance: 0 = again, 1 = hard, 2 = good, 3 = easy
    switch (performance) {
      case 0: // Again (incorrect answer)
        newInterval = 1;
        newEaseFactor = Math.max(this.minEaseFactor, easeFactor - 0.2);
        break;
      
      case 1: // Hard (correct but difficult)
        newInterval = Math.max(1, currentInterval * 1.2);
        newEaseFactor = Math.max(this.minEaseFactor, easeFactor - 0.15);
        break;
      
      case 2: // Good (correct)
        if (currentInterval === 1) {
          newInterval = 6;
        } else if (currentInterval === 6) {
          newInterval = Math.round(currentInterval * easeFactor);
        } else {
          newInterval = Math.round(currentInterval * easeFactor);
        }
        break;
      
      case 3: // Easy (very confident)
        newInterval = Math.round(currentInterval * easeFactor * 1.3);
        newEaseFactor = Math.min(2.5, easeFactor + 0.15);
        break;
      
      default:
        newInterval = currentInterval;
    }

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    return {
      questionId,
      interval: newInterval,
      easeFactor: newEaseFactor,
      nextReviewDate: nextReviewDate.toISOString(),
      lastReviewed: new Date().toISOString(),
      reviewCount: 1
    };
  }

  // Get questions due for review
  getQuestionsForReview(reviewData) {
    const now = new Date();
    return reviewData.filter(item => {
      const nextReview = new Date(item.nextReviewDate);
      return nextReview <= now;
    });
  }

  // Update question performance
  updateQuestionPerformance(questionId, performance, existingData = {}) {
    const currentInterval = existingData.interval || 1;
    const currentEaseFactor = existingData.easeFactor || 2.5;
    
    return this.calculateNextReview(questionId, performance, currentInterval, currentEaseFactor);
  }
}

export default SpacedRepetitionManager;
