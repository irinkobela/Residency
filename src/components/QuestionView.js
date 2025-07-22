// src/components/QuestionView.js
import React, { useState, useEffect, memo, useRef } from 'react';
import './QuestionView.css';

const QuestionView = ({
  question,
  onAnswerResult,
  showExplanation,
  toggleExplanation,
  alwaysShowCorrectAnswer,
  isForcedAnswered,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(isForcedAnswered || false);
  const explanationRef = useRef(null);
  const questionRef = useRef(null); // <--- NEW: Ref for the question card itself

  useEffect(() => {
    // Reset internal state when question changes OR when isForcedAnswered changes
    setSelectedAnswer(null);
    setIsAnswered(isForcedAnswered || false);

    // <--- NEW: Scroll to the top of the question when a new question is loaded
    if (questionRef.current) {
      questionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start' // Scrolls the top of the element to the top of the viewport
      });
    }
  }, [question, isForcedAnswered]); // Added question to dependencies to trigger on question change

  useEffect(() => {
    // Explanation visibility logic considering both external showExplanation and internal isAnswered state
    // AND the new alwaysShowCorrectAnswer (if the component uses it for display)
    const shouldScroll = (showExplanation || (isAnswered && alwaysShowCorrectAnswer)) && explanationRef.current;
    if (shouldScroll) {
      explanationRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [showExplanation, isAnswered, alwaysShowCorrectAnswer]);

  const handleAnswerClick = (answer) => {
    // If feedback is already showing (either by user click or by force), prevent re-clicking
    if (isAnswered) return;
    setSelectedAnswer(answer);
    setIsAnswered(true); // Set QuestionView's internal state to answered
    if (onAnswerResult) {
      onAnswerResult(question.id, answer.isCorrect); // Pass result up to parent
    }
  };

  const handleToggleExplanation = (e) => {
    e.stopPropagation();
    // Only allow manual toggle if explanation is not meant to be always shown by default
    // and if it's not currently forced answered.
    if (!alwaysShowCorrectAnswer && !isForcedAnswered) {
      toggleExplanation();
    }
  };

  const getButtonClassName = (answer) => {
    // If the question is in an 'answered' state (either by user click or forced)
    if (isAnswered) {
      if (answer.isCorrect) {
        return "answer-button correct"; // Always highlight correct if answered
      }
      // If the user picked this specific answer AND it was incorrect
      if (selectedAnswer === answer && !answer.isCorrect) {
        return "answer-button incorrect";
      }
      // If the question is forced answered, but this specific answer wasn't picked (and isn't correct),
      // it just gets the default style. The correct one is handled above.
    }
    return "answer-button"; // Default style if not answered or not incorrect
  };

  // Find the correct answer text for display
  const correctAnswerText = question.answers.find(a => a.isCorrect)?.text;

  // Determine if explanation sections should be rendered
  const shouldShowFeedbackSections = isAnswered || isForcedAnswered;

  return (
    // <--- NEW: Attach the questionRef to the main question-card div
    <div className="question-card" ref={questionRef}>
      <h2 className="question-text">❓ {question.question}</h2>
      <div className="answers-container">
        {question.answers.map((answer, index) => (
          <button
            key={index}
            className={getButtonClassName(answer)}
            onClick={() => handleAnswerClick(answer)}
            disabled={isAnswered} // Disable if already answered (internally or forced)
          >
            {answer.text}
          </button>
        ))}
      </div>

      {shouldShowFeedbackSections && (
        <div className="correct-answer-section">
          <p className="correct-answer-text">
            ✅ სწორი პასუხია: <strong>{correctAnswerText}</strong>
          </p>
        </div>
      )}

      {shouldShowFeedbackSections && (
        <div className="explanation-section" ref={explanationRef}>
          {/* Only show toggle button if NOT in alwaysShowCorrectAnswer mode AND not forced answered */}
          {!alwaysShowCorrectAnswer && !isForcedAnswered && (
            <button className="explanation-toggle" onClick={handleToggleExplanation}>
              {showExplanation ? '🙈 ახსნის დამალვა' : '📖 ახსნის ნახვა'}
            </button>
          )}
          {/* Explanation content visibility depends on showExplanation prop passed from parent
              OR if it's forced answered and alwaysShowCorrectAnswer is true. */}
          {(showExplanation || (isAnswered && alwaysShowCorrectAnswer) || isForcedAnswered) && (
            <p className="explanation-text">ℹ️ {question.explanation}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(QuestionView);
