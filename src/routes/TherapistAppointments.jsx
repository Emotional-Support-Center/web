import React from "react";
import HeadBarTherapist from "../components/therapistHeadBar";
import LeftbarTherapist from "../components/therapistLeftBar";
import Calendar from "../components/Calendar";
import "../css/TherapistLayout.css";
import "../css/Calendar.css";

const TherapistAppointments = () => {
    return (
        <div className="dashboard-layout">
            <LeftbarTherapist />
            <div className="dashboard-main">
                <HeadBarTherapist />
                <div className="dashboard-content">
                    <h2 className="dashboard-title">Appointments</h2>
                    <div className="calendar-container">
                        <Calendar />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TherapistAppointments;
