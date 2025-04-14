import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './routes/LandingPage';
import AuthPage from './routes/AuthPage';
import TherapistDashboard from './routes/TherapistDashboard';
import PatientDashboard from './routes/PatientDashboard';
import { AuthProvider, useAuth } from './services/authContext';
import Appointments from "./routes/Appointments";
import TherapistPage from "./routes/TherapistPage";
import ProtectedRoute from "./services/ProtectedRoute";
import LeftBar from "./components/LeftBar";
import HeadBar from "./components/HeadBar";
import PatientSettings from "./routes/PatientSettings";
import TherapistSettings from "./routes/TherapistSettings";



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
    if (userRole === "therapist") return <TherapistDashboard />;
    if (userRole === "patient") return <PatientDashboard />;
    return <div>Unauthorized</div>;
}

function SettingsRedirect() {
    const { userRole } = useAuth();
    if (userRole === "therapist") return <TherapistSettings />;
    if (userRole === "patient") return <PatientSettings />;
    return <div>Unauthorized</div>;
}



function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/auth" element={<AuthPage />} />

                    <Route path="/dashboard" element={
                        <ProtectedRoute allowedRoles={["therapist", "patient"]}>
                            <Layout>
                                <DashboardRedirect />
                            </Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="/settings" element={
                        <ProtectedRoute allowedRoles={["therapist", "patient"]}>
                            <Layout>
                                <SettingsRedirect />
                            </Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="/appointments" element={
                        <ProtectedRoute allowedRoles={["therapist","patient"]}>
                            <Layout>
                                <Appointments />
                            </Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="/mypage" element={
                        <ProtectedRoute allowedRoles={["therapist"]}>
                            <Layout>
                                <TherapistPage />
                            </Layout>
                        </ProtectedRoute>
                    } />

                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;