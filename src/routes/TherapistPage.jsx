import React from "react";
import "../css/TherapistPage.css";
import { useAuth } from "../services/authContext";
import HeadbarTherapist from "../components/therapistHeadBar";
import LeftbarTherapist from "../components/therapistLeftBar";

const MyPage = () => {
    const { userData } = useAuth();

    const slots = [
        "10:00 am", "10:30 am", "11:00 am", "11:30 am",
        "12:00 pm", "12:30 pm", "01:00 pm", "01:30 pm"
    ];

    return (
        <div className="dashboard-layout">
            <LeftbarTherapist />
            <div className="dashboard-main">
                <HeadbarTherapist />
                <div className="mypage-container">
                    <div className="therapist-profile">
                        <img
                            src={userData?.photoURL || "/default-avatar.png"}
                            alt="Therapist"
                            className="therapist-photo"
                        />
                        <div className="therapist-info">
                            <h2>{`Dr. ${userData?.firstName || ""} ${userData?.lastName || ""}`}</h2>
                            <div className={`verification-badge ${userData?.verified ? "verified" : "not-verified"}`}>
                                {userData?.verified ? "Verified" : "Not Verified"}
                            </div>
                            <p className="speciality">{userData?.specialties}</p>
                            <div className="about">
                                <strong>About</strong>
                                <p>{userData?.about || "No bio available."}</p>
                            </div>
                            <p className="fee">Appointment fee: ${userData?.fee || "0"}</p>
                        </div>
                    </div>

                    <div className="booking-section">
                        <h3>Booking Slots</h3>
                        <div className="day-selector">
                            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
                                <div key={i} className="day-circle">{d}</div>
                            ))}
                        </div>
                        <div className="slot-selector">
                            {slots.map((slot, idx) => (
                                <button key={idx} className="slot-btn">{slot}</button>
                            ))}
                        </div>
                        <button className="book-btn">Book an appointment</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyPage;
