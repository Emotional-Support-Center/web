import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';
import '../css/SignIn.css';

function SignIn() {
    const [role, setRole] = useState('patient');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            await loginUser(email, password, role);
            alert(`${role} login successful!`);
            // navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className={`signin-container ${role}`}>
            <div className="form-card">
                <div className="role-toggle">
                    <button className={role === 'patient' ? 'active' : ''} onClick={() => setRole('patient')}>Patient</button>
                    <button className={role === 'therapist' ? 'active' : ''} onClick={() => setRole('therapist')}>Therapist</button>
                </div>

                <h2>{role === 'patient' ? 'Patient Login' : 'Therapist Login'}</h2>
                {error && <p className="error">{error}</p>}
                <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
                <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
                <button onClick={handleLogin}>Sign In</button>

                <p className="link-text" onClick={() => {
                    if (role === 'patient') navigate('/signup-patient');
                    else navigate('/signup-therapist');
                }}>
                    No account? Sign Up as {role}
                </p>
            </div>
        </div>
    );
}

export default SignIn;
