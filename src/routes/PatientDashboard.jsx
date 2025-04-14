import React, { useEffect, useState } from "react";
import PatientInfoPopup from "../components/PatientInfoPopUp";
import { useAuth } from "../services/authContext";
import "../css/PatientDashboard.css";
import { db } from "../firebase/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

const PatientDashboard = () => {
    const { currentUser, userData, setUserData } = useAuth();
    const [showPopup, setShowPopup] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [therapistMap, setTherapistMap] = useState({});

    useEffect(() => {
        if (userData?.showWelcomePopup) {
            setShowPopup(true);
        }
    }, [userData]);

    useEffect(() => {
        const fetchAppointments = async () => {
            if (!currentUser?.uid) return;
            const q = query(
                collection(db, "appointments"),
                where("patientId", "==", currentUser.uid)
            );
            const snapshot = await getDocs(q);
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAppointments(list);

            const ids = [...new Set(list.map(a => a.therapistId))];
            const map = {};
            await Promise.all(ids.map(async (tid) => {
                const snap = await getDoc(doc(db, "therapists", tid));
                if (snap.exists()) {
                    map[tid] = snap.data();
                }
            }));
            setTherapistMap(map);
        };

        fetchAppointments();
    }, [currentUser]);

    const handlePopupSave = async (updatedData) => {
        setUserData(prev => ({ ...prev, ...updatedData }));
        setShowPopup(false);
    };

    const approved = appointments.filter(a => a.status === "approved");
    const pending = appointments.filter(a => a.status === "pending");
    const payPending = appointments.filter(a => a.status === "waitingPayment");

    return (
        <div className="dashboard-content">
            <div className="top-cards">
                <div className="card">
                    <h3>{approved.length}</h3>
                    <p>Total Sessions</p>
                </div>
                <div className="card">
                    <h3>{appointments.length}</h3>
                    <p>Appointments</p>
                </div>
                <div className="card">
                    <h3>{Object.keys(therapistMap).length}</h3>
                    <p>Therapists</p>
                </div>
            </div>
            <div className="appointment-sections">
                <section>
                    <h3 className="section-title">My Therapists</h3>

                </section>

                <section>
                    <h3 className="section-title">Pending Appointments</h3>
                    {pending.map(appt => {
                        const therapist = therapistMap[appt.therapistId] || {};
                        return (
                            <div key={appt.id} className="request-card">
                                <div className="patient-info">
                                    <img src={therapist.photoURL || "/default-avatar.png"} alt="Therapist" />
                                    <div>
                                        <span className="patient-name">{therapist.firstName} {therapist.lastName}</span><br />
                                        <span className="appointment-info">awaiting approval for {appt.date}, {appt.time}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </section>

                <section>
                    <h3 className="section-title">Unpaid Appointments</h3>
                    {payPending.map(appt => {
                        const therapist = therapistMap[appt.therapistId] || {};
                        return (
                            <div key={appt.id} className="request-card">
                                <div className="patient-info">
                                    <img src={therapist.photoURL || "/default-avatar.png"} alt="Therapist" />
                                    <div>
                                        <span className="patient-name">{therapist.firstName} {therapist.lastName}</span><br />
                                        <span className="appointment-info">unpaid appointment on {appt.date}</span>
                                    </div>
                                </div>
                                <button className="pay-button">Pay</button>
                            </div>
                        );
                    })}
                </section>

                <section>
                    <h3 className="section-title">Current Appointments</h3>
                    {approved.map(appt => {
                        const therapist = therapistMap[appt.therapistId] || {};
                        return (
                            <div key={appt.id} className="patient-card">
                                <div className="patient-info">
                                    <img src={therapist.photoURL || "/default-avatar.png"} alt="Therapist" />
                                    <div>
                                        <span className="patient-name">{therapist.firstName} {therapist.lastName}</span><br />
                                        <span className="appointment-info">{appt.date}, {appt.time}</span>
                                    </div>
                                </div>
                                <div className="action-buttons">
                                    <button>Join</button>
                                </div>
                            </div>
                        );
                    })}
                </section>
            </div>

            {showPopup && currentUser && (
                <PatientInfoPopup
                    userId={currentUser.uid}
                    onClose={() => setShowPopup(false)}
                    onSave={handlePopupSave}
                />
            )}
        </div>
    );
};

export default PatientDashboard;
