import React from "react";
import "../css/MyTherapists.css";
import { useNavigate } from "react-router-dom";

const MyTherapists = () => {
    const navigate = useNavigate();

    return (
        <div className="mytherapists-container">
            <h2 className="section-title">My Therapists</h2>
            <div className="therapist-card">
                <div className="therapist-info" onClick={() => navigate("/account/123")}>
                    <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="therapist" />
                    <h4>Dr. Alice Carter</h4>
                </div>
            </div>

            <h2 className="section-title">Waiting Payments</h2>
            <div className="appointment-card">
                <div className="therapist-info">
                    <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="therapist" />
                    <h4>Dr. Alice Carter – July 25, 13:00</h4>
                </div>
                <div className="therapist-actions">
                    <button>Pay</button>
                </div>
            </div>

            <h2 className="section-title">Waiting Requests</h2>
            <div className="appointment-card">
                <div className="therapist-info">
                    <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="therapist" />
                    <h4>Dr. Bob Smith – July 28, 09:00 (Pending)</h4>
                </div>
            </div>
        </div>
    );
};

export default MyTherapists;
