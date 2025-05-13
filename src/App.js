// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/authContext';
import ProtectedRoute from './services/ProtectedRoute';

import LandingPage        from './routes/LandingPage';
import AuthPage           from './routes/AuthPage';
import TherapistDashboard from './routes/TherapistDashboard';
import PatientDashboard   from './routes/PatientDashboard';
import TherapistPage      from './routes/TherapistPage';
import Appointments       from './routes/Appointments';
import PaymentPage        from './routes/PaymentPage';
import TherapistSettings  from './routes/TherapistSettings';
import PatientSettings    from './routes/PatientSettings';
import TherapistSearch    from './routes/TherapistSearch';
import AdminAuth          from './routes/AdminAuth';
import AdminPage          from './routes/AdminPage';
import MeetingPage        from './routes/MeetingPage';

import LeftBar from './components/LeftBar';
import HeadBar from './components/HeadBar';

function Layout({ children }) {
  return (
    <div className="dashboard-layout">
      <LeftBar />
      <div className="dashboard-main">
        <HeadBar />
        {children}
      </div>
    </div>
  );
}

function DashboardRedirect() {
  const { userRole } = useAuth();
  if (userRole === 'therapist') return <TherapistDashboard />;
  if (userRole === 'patient')   return <PatientDashboard />;
  return <div>Unauthorized</div>;
}

function SettingsRedirect() {
  const { userRole } = useAuth();
  if (userRole === 'therapist') return <TherapistSettings />;
  if (userRole === 'patient')   return <PatientSettings />;
  return <div>Unauthorized</div>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* Public */}
          <Route path="/"    element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['therapist','patient']}>
              <Layout><DashboardRedirect/></Layout>
            </ProtectedRoute>
          }/>

          {/* Settings */}
          <Route path="/settings" element={
            <ProtectedRoute allowedRoles={['therapist','patient']}>
              <Layout><SettingsRedirect/></Layout>
            </ProtectedRoute>
          }/>

          {/* Other app routes */}
          <Route path="/appointments" element={
            <ProtectedRoute allowedRoles={['therapist','patient']}>
              <Layout><Appointments/></Layout>
            </ProtectedRoute>
          }/>
          <Route path="/mypage" element={
            <ProtectedRoute allowedRoles={['therapist']}>
              <Layout><TherapistPage/></Layout>
            </ProtectedRoute>
          }/>
          <Route path="/account/:id" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <Layout><TherapistPage/></Layout>
            </ProtectedRoute>
          }/>
          <Route path="/payment/:appointmentId" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <Layout><PaymentPage/></Layout>
            </ProtectedRoute>
          }/>
          <Route path="/therapists" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <Layout><TherapistSearch/></Layout>
            </ProtectedRoute>
          }/>

          {/* Jitsi Meeting */}
          <Route path="/meeting/:appointmentId" element={
            <ProtectedRoute allowedRoles={['therapist','patient']}>
              <Layout><MeetingPage/></Layout>
            </ProtectedRoute>
          }/>

          {/* Admin */}
          <Route path="/adminAuth"  element={<AdminAuth />} />
          <Route path="/adminPanel" element={<AdminPage />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}
