import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './routes/SignIn';
import SignUpPatient from './routes/SignUpPatient';
import SignUpTherapist from './routes/SignUpTherapist';

function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/signup-patient" element={<SignUpPatient />} />
          <Route path="/signup-therapist" element={<SignUpTherapist />} />
        </Routes>
      </Router>
  );
}

export default App;
