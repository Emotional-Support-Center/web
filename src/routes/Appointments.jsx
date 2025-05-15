import React from "react";
import Calendar from "../components/Calendar";
import "../css/Layout.css";
import "../css/Calendar.css";
import { useAuth } from "../services/authContext";

const Appointments = () => {
    const { userRole } = useAuth();

    return (
        <div className="dashboard-layout">
            <div className="dashboard-main">
                <div className="dashboard-content">
                    <h2 className="dashboard-title">Appointments</h2>
                    <div className="calendar-container">
                        <Calendar isTherapist={userRole === "therapist"} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Appointments;
