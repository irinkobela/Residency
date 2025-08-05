import React, { useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import './ProgressDashboard.css';

const ProgressDashboard = ({ questions, incorrectlyAnsweredQuestions }) => {
  const [answeredQuestions] = useLocalStorage('answeredQuestions', []);
  const [correctAnswers] = useLocalStorage('correctAnswers', []);
  const [studyStreak, setStudyStreak] = useLocalStorage('studyStreak', 0);
  const [lastStudyDate, setLastStudyDate] = useLocalStorage('lastStudyDate', null);
  const [tagStats, setTagStats] = useState({});

  useEffect(() => {
    const stats = {};
    questions.forEach(question => {
      question.tags.forEach(tag => {
        if (!stats[tag]) {
          stats[tag] = { total: 0, correct: 0, attempted: 0 };
        }
        stats[tag].total++;
        
        if (answeredQuestions.includes(question.id)) {
          stats[tag].attempted++;
          if (correctAnswers.includes(question.id)) {
            stats[tag].correct++;
          }
        }
      });
    });
    setTagStats(stats);

    // Update study streak
    const today = new Date().toDateString();
    if (lastStudyDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastStudyDate === yesterday.toDateString()) {
        setStudyStreak(prev => prev + 1);
      } else if (lastStudyDate !== today) {
        setStudyStreak(1);
      }
      setLastStudyDate(today);
    }
  }, [questions, answeredQuestions, correctAnswers, lastStudyDate, setStudyStreak, setLastStudyDate]);

  const totalQuestions = questions.length;
  const totalAnswered = answeredQuestions.length;
  const totalCorrect = correctAnswers.length;
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const completionRate = Math.round((totalAnswered / totalQuestions) * 100);

  return (
    <div className="progress-dashboard">
      <h2>📊 შენი პროგრესი</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{completionRate}%</div>
          <div className="stat-label">დასრულებული</div>
          <div className="stat-detail">{totalAnswered} / {totalQuestions}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{accuracy}%</div>
          <div className="stat-label">სისწორე</div>
          <div className="stat-detail">{totalCorrect} სწორი პასუხი</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{studyStreak}</div>
          <div className="stat-label">🔥 სწავლის სერია</div>
          <div className="stat-detail">დღე ზედიზედ</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{incorrectlyAnsweredQuestions.length}</div>
          <div className="stat-label">📝 გასამეორებელი</div>
          <div className="stat-detail">არასწორი პასუხები</div>
        </div>
      </div>

      <div className="tag-performance">
        <h3>📋 კატეგორიების მიხედვით</h3>
        <div className="tag-stats">
          {Object.entries(tagStats).map(([tag, stats]) => (
            <div key={tag} className="tag-stat">
              <div className="tag-name">{tag}</div>
              <div className="tag-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${stats.attempted > 0 ? (stats.correct / stats.attempted) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="progress-text">
                  {stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0}%
                  ({stats.attempted}/{stats.total})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;
