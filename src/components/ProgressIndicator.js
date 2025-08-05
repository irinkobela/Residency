import React from 'react';
import './ProgressIndicator.css';

const ProgressIndicator = ({ 
  current, 
  total, 
  correct = 0, 
  incorrect = 0,
  showStats = true,
  className = ''
}) => {
  const progressPercentage = (current / total) * 100;
  const accuracyPercentage = correct + incorrect > 0 ? (correct / (correct + incorrect)) * 100 : 0;

  return (
    <div className={`progress-indicator ${className}`}>
      <div className="progress-header">
        <span className="progress-text">
          კითხვა {current} / {total}
        </span>
        {showStats && (correct + incorrect > 0) && (
          <span className="accuracy-text">
            სიზუსტე: {accuracyPercentage.toFixed(1)}%
          </span>
        )}
      </div>
      
      <div className="progress-bar-container">
        <div 
          className="progress-bar" 
          style={{ width: `${progressPercentage}%` }}
        />
        
        {showStats && (
          <div className="progress-segments">
            {correct > 0 && (
              <div 
                className="progress-segment correct" 
                style={{ 
                  width: `${(correct / total) * 100}%`,
                  left: '0%'
                }}
              />
            )}
            {incorrect > 0 && (
              <div 
                className="progress-segment incorrect" 
                style={{ 
                  width: `${(incorrect / total) * 100}%`,
                  left: `${(correct / total) * 100}%`
                }}
              />
            )}
          </div>
        )}
      </div>
      
      {showStats && (
        <div className="progress-stats">
          <span className="stat correct">✅ სწორი: {correct}</span>
          <span className="stat incorrect">❌ არასწორი: {incorrect}</span>
          <span className="stat remaining">⏳ დარჩენილი: {total - current}</span>
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator;
