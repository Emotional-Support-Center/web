import React, { useState, useEffect } from "react";
import { registerPatient, registerTherapist, loginUser } from "../services/authService";
import "../css/AuthPage.css";
import therapistImg from "../assets/therapist.png";
import patientImg from "../assets/medical.png";
import {useLocation} from "react-router-dom";
import { useNavigate } from "react-router-dom";


const AuthPage = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [role, setRole] = useState("patient");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [popup, setPopup] = useState({ show: false, message: "", type: "" });
    const [fadeState, setFadeState] = useState("fade-in");
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const urlRole = params.get("role");
    const navigate=useNavigate()

    useEffect(() => {
        if (urlRole === "patient" || urlRole === "therapist") {
            setRole(urlRole);
            setIsSignUp(true);
        }
    }, [urlRole]);

    const resetFields = () => {
        setEmail("");
        setPassword("");
    };

    const showPopup = (message, type = "success") => {
        setPopup({ show: true, message, type });
        setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isSignUp) {
                if (role === "patient") {
                    await registerPatient(email, password);
                } else {
                    await registerTherapist(email, password, {});
                }
                showPopup("Registration successful! You can now log in.", "success");
            } else {
                await loginUser(email, password, role);
                showPopup("You have successfully logged in!", "success");
                setTimeout(() => {
                    navigate("/dashboard");
                }, 1000);
                resetFields();
            }
        } catch (err) {
            const msg = err.message.includes("auth")
                ? "Incorrect email or password. Please try again."
                : err.message;
            showPopup(msg, "error");
        }
    };

    const toggleForm = (mode) => {
        setIsSignUp(mode);
        resetFields();
    };

    // Role geçişi için fade animasyonu
    const handleRoleSwitch = (newRole) => {
        if (newRole !== role) {
            setFadeState("fade-out");
            setTimeout(() => {
                setRole(newRole);
                setFadeState("fade-in");
            }, 400); // fade-out süresiyle aynı
        }
    };

    const getPanelMessage = () => {
        if (isSignUp) {
            return role === "patient"
                ? "Join as a Patient to start your healing journey."
                : "Therapists, join our platform to support those in need.";
        } else {
            return role === "patient"
                ? "New here? Let's get started by creating your account."
                : "Therapists, create your account to begin offering support.";
        }
    };

    const getRightPanelMessage = () => {
        if (isSignUp) {
            return role === "patient"
                ? "Already have an account? Sign in and reconnect with your journey."
                : "Already registered? Sign in to continue supporting patients.";
        } else {
            return role === "patient"
                ? "Welcome back. Sign in to continue your support path."
                : "Welcome back Therapist. Let’s continue helping others.";
        }
    };

    return (
        <div className={`container1 ${isSignUp ? "sign-up-mode" : ""}`}>
            {popup.show && (
                <div className={`popup ${popup.type}`}>{popup.message}</div>
            )}

            <div className="top-left-title">Emotional Support Center</div>

            <div className="top-right-logo">
                <img
                    src={role === "patient" ? patientImg : therapistImg}
                    alt={role}
                    className="role-icon"
                />
            </div>

            <div className="forms-container">
                <div className="signin-signup">
                    <form
                        className={`sign-in-form ${!isSignUp ? "active-form" : ""}`}
                        onSubmit={handleSubmit}
                    >
                        <h2 className="title">Welcome back!</h2>

                        <div className="role-toggle">
                            <button
                                type="button"
                                className={`toggle-btn ${role === "patient" ? "active" : ""}`}
                                onClick={() => handleRoleSwitch("patient")}
                            >
                                Patient
                            </button>
                            <button
                                type="button"
                                className={`toggle-btn ${role === "therapist" ? "active" : ""}`}
                                onClick={() => handleRoleSwitch("therapist")}
                            >
                                Therapist
                            </button>
                        </div>

                        <div className="input-field">
                            <i className="fas fa-user" />
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-field">
                            <i className="fas fa-lock" />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <input
                            type="submit"
                            value="Login"
                            className="btn solid"
                        />
                    </form>

                    <form
                        className={`sign-up-form ${isSignUp ? "active-form" : ""}`}
                        onSubmit={handleSubmit}
                    >
                        <h2 className="title">Create your account</h2>

                        <div className="role-toggle">
                            <button
                                type="button"
                                className={`toggle-btn ${role === "patient" ? "active" : ""}`}
                                onClick={() => handleRoleSwitch("patient")}
                            >
                                Patient
                            </button>
                            <button
                                type="button"
                                className={`toggle-btn ${role === "therapist" ? "active" : ""}`}
                                onClick={() => handleRoleSwitch("therapist")}
                            >
                                Therapist
                            </button>
                        </div>

                        <div className="input-field">
                            <i className="fas fa-user" />
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-field">
                            <i className="fas fa-lock" />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <input
                            type="submit"
                            value="Sign Up"
                            className="btn solid"
                        />
                    </form>
                </div>
            </div>

            <div className="panels-container">
                <div className="panel left-panel">
                    <div className={`content role-message ${fadeState}`}>
                        <h3>{`Hello ${role === "patient" ? "Patient" : "Therapist"}`}</h3>
                        <p>{getPanelMessage()}</p>
                        <button className="btn transparent" onClick={() => toggleForm(true)}>
                            Sign Up
                        </button>
                    </div>
                </div>

                <div className="panel right-panel">
                    <div className={`content role-message ${fadeState}`}>
                        <h3>{`Returning ${role === "patient" ? "Patient" : "Therapist"}`}</h3>
                        <p>{getRightPanelMessage()}</p>
                        <button className="btn transparent" onClick={() => toggleForm(false)}>
                            Sign In
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
