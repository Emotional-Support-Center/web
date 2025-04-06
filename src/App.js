import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './routes/LandingPage';
import AuthPage from './routes/AuthPage';
import TherapistDashboard from './routes/TherapistDashboard';
import { AuthProvider } from './services/authContext';
import Settings from "./routes/TherapistSettings";
import Appointments from "./routes/TherapistAppointments";
import TherapistPage from "./routes/TherapistPage";

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/dashboard" element={<TherapistDashboard />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/appointments" element={<Appointments />} />
                    <Route path="/mypage" element={<TherapistPage />}/>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
