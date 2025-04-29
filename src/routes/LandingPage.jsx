import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/LandingPage.css';
import heroImg from '../assets/support.png';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-wrapper">
            <header className="landing-header">
                <div className="logo">Emotional Support Center</div>
                <nav>
                    <a href="#about">About</a>
                    <button className="login-btn" onClick={() => navigate('/auth')}>Login</button>
                </nav>
            </header>

            <section className="hero-section">
                <div className="hero-text">
                    <h1>Welcome to Emotional Support Center</h1>
                    <p>Connect with therapists or find patients in a safe, secure environment. Begin your journey towards better mental health today.</p>
                    <div className="hero-buttons">
                        <button onClick={() => navigate('/auth?role=patient')}>Get Started as Patient</button>
                        <button className="outline" onClick={() => navigate('/auth?role=therapist')}>Get Started as Therapist</button>
                    </div>
                </div>
                <div className="hero-image">
                    <img src={heroImg} alt="Therapy illustration" />
                </div>
            </section>

            <footer className="landing-footer">
                © 2025 Emotional Support Center
            </footer>
        </div>
    );
};

export default LandingPage;
