// src/components/ReviewDeck.js
import React, { useState, useEffect, useCallback } from 'react';
import { useShortcuts } from '../contexts/ShortcutContext';
import QuestionView from './QuestionView';
import './ReviewDeck.module.css';

const ReviewDeck = ({
  questions,
  incorrectlyAnsweredQuestions,
  onAnswerResult,
  onBackToQuiz,
  showExplanation,
  toggleExplanation,
  clearIncorrectlyAnsweredQuestions,
}) => {
  const { shortcutPrev, shortcutNext, shortcutExplanation } = useShortcuts();

  const [reviewQueue, setReviewQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasAnsweredCurrentQuestion, setHasAnsweredCurrentQuestion] = useState(false); // <--- ADD THIS
  const [isShowingFeedbackDelay, setIsShowingFeedbackDelay] = useState(false);     // <--- ADD THIS

  // Reset review queue and flags when component mounts or relevant props change
  useEffect(() => {
    const initialQueue = questions.filter(q => incorrectlyAnsweredQuestions.includes(q.id));
    setReviewQueue(initialQueue);
    setCurrentIndex(0);
    setHasAnsweredCurrentQuestion(false); // Reset for a new queue
    setIsShowingFeedbackDelay(false); // Reset feedback flag
  }, [questions, incorrectlyAnsweredQuestions]);

  // Function to move to the next question (after feedback delay)
  const advanceToNextQuestion = useCallback(() => {
    setHasAnsweredCurrentQuestion(false); // Hide feedback before moving to next
    setIsShowingFeedbackDelay(false); // Reset delay flag
    if (currentIndex < reviewQueue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0); // Loop back for continuous review, or handle completion
    }
  }, [currentIndex, reviewQueue.length]);

  // Function to move to the previous question (after feedback delay)
  const goToPreviousQuestion = useCallback(() => {
    setHasAnsweredCurrentQuestion(false); // Hide feedback before moving to previous
    setIsShowingFeedbackDelay(false); // Reset delay flag
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      setCurrentIndex(0); // Stay at the first question
    }
  }, [currentIndex]);


  // This is the callback that QuestionView will trigger when an answer button is clicked.
  const handleAnswerClickFromQuestionView = useCallback((questionId, isCorrect) => {
    if (isShowingFeedbackDelay) return; // Prevent multiple clicks during delay

    setHasAnsweredCurrentQuestion(true); // Mark current question as answered for feedback display
    setIsShowingFeedbackDelay(true); // Start the feedback delay

    // Notify the parent component about the answer result
    if (onAnswerResult) {
      onAnswerResult(questionId, isCorrect);
    }

    // After a short delay, update the review queue based on correctness
    setTimeout(() => {
      let newIndex = currentIndex;
      let newQueue = [...reviewQueue];

      if (isCorrect) {
        // If correct, remove the question from the queue
        newQueue = reviewQueue.filter(q => q.id !== questionId);
        // Adjust index if the current question was removed and it was the last one
        newIndex = Math.min(currentIndex, newQueue.length - 1);
      } else {
        // If incorrect, move it to the end of the queue for re-review
        const questionToMove = reviewQueue[currentIndex];
        newQueue = reviewQueue.filter(q => q.id !== questionId);
        if (questionToMove) { // Ensure the question exists before re-adding
          newQueue.push(questionToMove);
        }
        newIndex = (currentIndex + 1) % newQueue.length; // Move to next, looping if needed
      }

      setReviewQueue(newQueue);
      setCurrentIndex(newIndex);
      setHasAnsweredCurrentQuestion(false); // Reset for the next question that will load
      setIsShowingFeedbackDelay(false); // End the feedback delay
    }, 1500); // 1.5-second delay to show feedback before moving
  }, [currentIndex, onAnswerResult, reviewQueue, isShowingFeedbackDelay]);


  const handleBackToQuiz = useCallback(() => {
    if (clearIncorrectlyAnsweredQuestions) {
      clearIncorrectlyAnsweredQuestions();
    }
    onBackToQuiz();
  }, [clearIncorrectlyAnsweredQuestions, onBackToQuiz]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName.toLowerCase() === 'input') {
        return;
      }
      // Only allow navigation if not currently in a feedback delay
      if (!isShowingFeedbackDelay) {
        if (e.key === shortcutNext) {
          e.preventDefault();
          advanceToNextQuestion();
        }
        if (e.key === shortcutPrev) {
          e.preventDefault();
          goToPreviousQuestion();
        }
      }
      // Explanation toggle still works regardless of feedback delay
      if (e.key === shortcutExplanation || (shortcutExplanation === ' ' && e.code === 'Space')) {
        e.preventDefault(); // Prevent spacebar from scrolling
        toggleExplanation();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        handleBackToQuiz();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    shortcutPrev,
    shortcutNext,
    shortcutExplanation,
    advanceToNextQuestion,
    goToPreviousQuestion,
    toggleExplanation,
    handleBackToQuiz,
    isShowingFeedbackDelay // Dependency for disabling navigation
  ]);

  if (reviewQueue.length === 0) {
    return (
      <div className="review-deck-container">
        <h2>✨ გილოცავთ!</h2>
        <p>თქვენ წარმატებით უპასუხეთ ყველა მანამდე შეცდომით ნაპასუხებ კითხვას.</p>
        <button onClick={handleBackToQuiz}>🔙 დაბრუნება სწავლის რეჟიმზე</button>
      </div>
    );
  }

  const currentQuestion = reviewQueue[currentIndex];

  return (
    <div className="review-deck-container">
      <h2>🧠 "დამხეცების" რეჟიმი ({reviewQueue.length} კითხვა დარჩა)</h2>
      <QuestionView
        // Key is important to force QuestionView to re-render when the question object *or*
        // the feedback state changes, ensuring its internal state resets.
        key={currentQuestion.id + (hasAnsweredCurrentQuestion ? '_answered' : '_unanswered')}
        question={currentQuestion}
        onAnswerResult={handleAnswerClickFromQuestionView} // Pass our new wrapper function
        // Pass showExplanation prop to QuestionView. It will be true if the parent wants it,
        // OR if the current question has just been answered (to force feedback display).
        showExplanation={showExplanation || hasAnsweredCurrentQuestion} // <--- Use this to force explanation
        toggleExplanation={toggleExplanation}
        alwaysShowCorrectAnswer={true} // Inform QuestionView that it should always show feedback when isAnswered
        isForcedAnswered={hasAnsweredCurrentQuestion} // <--- Pass NEW PROP from ReviewDeck to QuestionView
      />
      <div className="navigation">
        <button onClick={goToPreviousQuestion} disabled={currentIndex === 0 || isShowingFeedbackDelay}>
          ◀️ წინა
        </button>
        <button onClick={advanceToNextQuestion} disabled={currentIndex === reviewQueue.length - 1 || isShowingFeedbackDelay}>
          ▶️ შემდეგი
        </button>
        <button onClick={handleBackToQuiz} disabled={isShowingFeedbackDelay}>🔙 დაბრუნება სწავლის რეჟიმზე</button>
      </div>
    </div>
  );
};

export default ReviewDeck;