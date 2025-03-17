import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerTherapist } from '../services/authService';
import '../css/SignUp.css';

function SignUpTherapist() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignup = async () => {
        try {
            await registerTherapist(email, password, {});
            alert("Therapist registered!");
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="signup-container">
            <div className="form-card">
                <h2>Therapist Sign Up</h2>
                {error && <p className="error">{error}</p>}
                <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
                <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
                <button onClick={handleSignup}>Sign Up</button>
                <p className="link-text" onClick={() => navigate('/')}>
                    Already have an account? Sign In
                </p>
            </div>
        </div>
    );
}

export default SignUpTherapist;
