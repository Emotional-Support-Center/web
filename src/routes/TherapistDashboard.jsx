import React, { useEffect, useState } from "react";
import HeadbarTherapist from "../components/therapistHeadBar";
import LeftbarTherapist from "../components/therapistLeftBar";
import TherapistInfoPopup from "../components/TherapistInfoPopup";
import { useAuth } from "../services/authContext";
import "../css/TherapistDashboard.css";

const TherapistDashboard = () => {
    const { currentUser, userData, setUserData } = useAuth();
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        if (userData?.showWelcomePopup) {
            setShowPopup(true);
        }
    }, [userData]);

    const handlePopupSave = () => {
        setUserData(prev => ({ ...prev, showWelcomePopup: false }));
        setShowPopup(false);
    };

    return (
        <div className="dashboard-layout">
            <LeftbarTherapist />
            <div className="dashboard-main">
                <HeadbarTherapist />
                <div className="dashboard-content">
                    <div className="top-cards">
                        <div className="card">
                            <h3>$0</h3>
                            <p>Earnings</p>
                        </div>
                        <div className="card">
                            <h3>0</h3>
                            <p>Appointments</p>
                        </div>
                        <div className="card">
                            <h3>0</h3>
                            <p>Patients</p>
                        </div>
                    </div>

                    <div className="latest-bookings">
                        <h4><i className="fas fa-calendar-alt"></i> Latest Appointments</h4>
                        <div className="booking-list">
                            <div className="booking-item placeholder">No appointments yet</div>
                        </div>
                    </div>
                </div>
            </div>

            {showPopup && currentUser && (
                <TherapistInfoPopup
                    userId={currentUser.uid}
                    existingData={userData}
                    onSave={handlePopupSave}
                    onClose={() => setShowPopup(false)}
                />
            )}
        </div>
    );
};

export default TherapistDashboard;
