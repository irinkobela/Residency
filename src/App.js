import React from 'react';
// The 'Router' import has been removed from this line
import { Routes, Route } from 'react-router-dom';
import StudyMode from './StudyMode';
import QuizMode from './components/QuizMode';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<StudyMode />} />
      <Route path="/quiz" element={<QuizMode />} />
    </Routes>
  );
};

export default App;