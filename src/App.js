import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PatientInfo from './PatientInfo';

function App() {
  return (
    <Router>
      <div className="container">
        <Routes>
          <Route path="/" element={<PatientInfo />} />
          <Route path="/callback" element={<PatientInfo />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
