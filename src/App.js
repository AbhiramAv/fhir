import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import PatientInfo from './PatientInfo';
import SignIn from './SignIn';

function App() {
  return (
    <Router>
      <div className="container">
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/patient-info" element={<PatientInfo />} />
          <Route path="/callback" element={<PatientInfo />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
