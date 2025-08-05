import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StudyMode from './StudyMode';
import QuizMode from './components/QuizMode';
import ResultsPage from './components/ResultsPage';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<StudyMode />} />
      <Route path="/quiz" element={<QuizMode />} />
      <Route path="/results" element={<ResultsPage />} />
    </Routes>
  );
};

export default App;
