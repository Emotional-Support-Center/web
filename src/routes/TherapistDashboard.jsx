import React, { useEffect, useState } from "react";
import TherapistInfoPopup from "../components/TherapistInfoPopup";
import { useAuth } from "../services/authContext";
import "../css/TherapistDashboard.css";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { approveAppointment, rejectAppointment } from "../services/appointmentService";

const TherapistDashboard = () => {
    const { currentUser, userData, setUserData } = useAuth();
    const [showPopup, setShowPopup] = useState(false);
    const [showCertWarning, setShowCertWarning] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [patientMap, setPatientMap] = useState({});

    useEffect(() => {
        if (userData?.showWelcomePopup) setShowPopup(true);
    }, [userData]);

    useEffect(() => {
        if (userData?.verified === false) setShowCertWarning(true);
        else setShowCertWarning(false);
    }, [userData?.verified]);

    useEffect(() => {
        const fetchAppointments = async () => {
            if (!currentUser?.uid) return;
            const q = query(
                collection(db, "appointments"),
                where("therapistId", "==", currentUser.uid)
            );
            const snapshot = await getDocs(q);
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAppointments(list);

            // Fetch patient data
            const ids = [...new Set(list.map(a => a.patientId))];
            const map = {};
            await Promise.all(ids.map(async (pid) => {
                const snap = await getDoc(doc(db, "patients", pid));
                if (snap.exists()) {
                    map[pid] = snap.data();
                }
            }));
            setPatientMap(map);
        };

        fetchAppointments();
    }, [currentUser]);

    const handlePopupSave = (updatedData) => {
        setUserData(prev => ({ ...prev, ...updatedData }));
        setShowPopup(false);
    };

    const closeCertWarning = () => setShowCertWarning(false);

    const approved = appointments.filter(a => a.status === "approved");
    const pending = appointments.filter(a => a.status === "pending");
    const payPending = appointments.filter(a => a.status === "waitingPayment");

    return (
        <div className="dashboard-layout">
            <div className="dashboard-main">
                {showCertWarning && (
                    <div className="certificate-warning">
                    <span>
                        To verify your profile, please upload your certificate from the <strong>Settings</strong> page.
                    </span>
                        <button className="close-warning" onClick={closeCertWarning}>×</button>
                    </div>
                )}

                <div className="dashboard-content">
                    <div className="top-cards">
                        <div className="card"><h3>${approved.length * (userData?.feeIndividual || 0)}</h3><p>Earnings</p></div>
                        <div className="card"><h3>{appointments.length}</h3><p>Appointments</p></div>
                        <div className="card"><h3>{[...new Set(appointments.map(a => a.patientId))].length}</h3><p>Patients</p></div>
                    </div>

                    <div className="appointment-sections">
                        <>
                            <h2 className="section-title">Patient Requests</h2>
                            {pending.map((appt) => {
                                const patient = patientMap[appt.patientId] || {};
                                return (
                                    <div key={appt.id} className="request-card">
                                        <div className="patient-info">
                                            <img src={patient.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt="Profile" />
                                            <div>
                                                <span className="patient-name">{patient.firstName} {patient.lastName}</span><br />
                                                <span className="appointment-info">
                                                requested appointment on {appt.date}, {appt.time}
                                            </span>
                                            </div>
                                        </div>
                                        <div className="request-buttons">
                                            <button
                                                className="approve"
                                                onClick={async () => {
                                                    await approveAppointment(appt.id, appt.therapistId, appt.patientId);
                                                    setAppointments(prev => prev.map(a =>
                                                        a.id === appt.id ? { ...a, status: "approved" } : a
                                                    ));
                                                }}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                className="reject"
                                                onClick={() => rejectAppointment(appt.id, appt.therapistId, appt.patientId)}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </>

                        <>
                            <h2 className="section-title">Unpaid Appointments</h2>
                            {payPending.map((appt) => {
                                const patient = patientMap[appt.patientId] || {};
                                return (
                                    <div key={appt.id} className="request-card">
                                        <div className="patient-info">
                                            <img src={patient.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt="Profile" />
                                            <div>
                                                <span className="patient-name">{patient.firstName} {patient.lastName}</span><br />
                                                <span className="appointment-info">
                                                has unpaid appointment on {appt.date}
                                            </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </>

                        <>
                            <h2 className="section-title">Current Appointments</h2>
                            {approved.map((appt) => {
                                const patient = patientMap[appt.patientId] || {};
                                return (
                                    <div key={appt.id} className="patient-card">
                                        <div className="patient-info">
                                            <img src={patient.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt="Profile" />
                                            <div>
                                                <span className="patient-name">{patient.firstName} {patient.lastName}</span><br />
                                                <span className="appointment-info">{appt.date}, {appt.time}</span>
                                            </div>
                                        </div>
                                        <div className="action-buttons">
                                            <button>Join</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </>
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
