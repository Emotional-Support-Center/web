// src/routes/PatientDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PatientInfoPopup from "../components/PatientInfoPopUp";
import { useAuth } from "../services/authContext";
import "../css/PatientDashboard.css";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";
import { db } from "../firebase/firebase";

const PatientDashboard = () => {
  const { currentUser, userData, setUserData } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [therapistMap, setTherapistMap] = useState({});
  const navigate = useNavigate();

  // 1) Load this patient's appointments + preload therapist data
  const fetchAppointments = async () => {
    if (!currentUser?.uid) return;

    const q = query(
      collection(db, "appointments"),
      where("patientId", "==", currentUser.uid)
    );
    const snap = await getDocs(q);
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setAppointments(list);

    const therapistIds = [...new Set(list.map(a => a.therapistId))];
    const map = {};
    await Promise.all(
      therapistIds.map(async tid => {
        const tsnap = await getDoc(doc(db, "therapists", tid));
        if (tsnap.exists()) {
          map[tid] = tsnap.data();
        }
      })
    );
    setTherapistMap(map);
  };

  // 2) Show welcome popup if needed
  useEffect(() => {
    if (userData?.showWelcomePopup) {
      setShowPopup(true);
    }
  }, [userData]);

  // 3) Fetch on mount / user change
  useEffect(() => {
    fetchAppointments();
  }, [currentUser]);

  const handlePopupSave = updatedData => {
    setUserData(prev => ({ ...prev, ...updatedData }));
    setShowPopup(false);
  };

  // 4) Categorize
  const pending    = appointments.filter(a => a.status === "pending");
  const payPending = appointments.filter(a => a.status === "waitingPayment");
  const approved   = appointments.filter(a => a.status === "approved");
  const done       = appointments.filter(a => a.status === "done");

  return (
    <div className="dashboard-content">
      <div className="top-cards">
        <div className="card">
          <h3>{done.length}</h3>
          <p>Total Sessions</p>
        </div>
        <div className="card">
          <h3>{approved.length + payPending.length}</h3>
          <p>Upcoming</p>
        </div>
        <div className="card">
          <h3>{[...new Set(done.map(a => a.therapistId))].length}</h3>
          <p>Therapists</p>
        </div>
      </div>

      <div className="appointment-sections">
        {/* My Therapists (could list here if desired) */}
        <section>
          <h3 className="section-title">My Therapists</h3>
        </section>

        {/* Pending Approval */}
        <section>
          <h3 className="section-title">Pending Approval</h3>
          {pending.map(appt => {
            const t = therapistMap[appt.therapistId] || {};
            return (
              <div key={appt.id} className="request-card">
                <div className="patient-info">
                  <img
                    src={t.photoURL || "/default-avatar.png"}
                    alt={`${t.firstName} ${t.lastName}`}
                  />
                  <div>
                    <span className="patient-name">
                      {t.firstName} {t.lastName}
                    </span>
                    <br />
                    <span className="appointment-info">
                      {appt.date}, {appt.time} — <strong>Pending</strong>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Unpaid */}
        <section>
          <h3 className="section-title">Unpaid Appointments</h3>
          {payPending.map(appt => {
            const t = therapistMap[appt.therapistId] || {};
            return (
              <div key={appt.id} className="request-card">
                <div className="patient-info">
                  <img
                    src={t.photoURL || "/default-avatar.png"}
                    alt={`${t.firstName} ${t.lastName}`}
                  />
                  <div>
                    <span className="patient-name">
                      {t.firstName} {t.lastName}
                    </span>
                    <br />
                    <span className="appointment-info">
                      {appt.date}, {appt.time} — <strong>Unpaid</strong>
                    </span>
                  </div>
                </div>
                <button
                  className="pay-button"
                  onClick={() => navigate(`/payment/${appt.id}`)}
                >
                  Pay
                </button>
              </div>
            );
          })}
        </section>

        {/* Upcoming */}
        <section>
          <h3 className="section-title">Upcoming Appointments</h3>
          {approved.map(appt => {
            const t = therapistMap[appt.therapistId] || {};
            return (
              <div key={appt.id} className="patient-card">
                <div className="patient-info">
                  <img
                    src={t.photoURL || "/default-avatar.png"}
                    alt={`${t.firstName} ${t.lastName}`}
                  />
                  <div>
                    <span className="patient-name">
                      {t.firstName} {t.lastName}
                    </span>
                    <br />
                    <span className="appointment-info">
                      {appt.date}, {appt.time} — <strong>Approved</strong>
                    </span>
                  </div>
                </div>
                <div className="action-buttons">
                  <button onClick={() => navigate(`/meeting/${appt.id}`)}>
                    Join
                  </button>
                </div>
              </div>
            );
          })}
        </section>

        {/* Completed */}
        <section>
          <h3 className="section-title">Completed Sessions</h3>
          {done.map(appt => {
            const t = therapistMap[appt.therapistId] || {};
            return (
              <div key={appt.id} className="patient-card">
                <div className="patient-info">
                  <img
                    src={t.photoURL || "/default-avatar.png"}
                    alt={`${t.firstName} ${t.lastName}`}
                  />
                  <div>
                    <span className="patient-name">
                      {t.firstName} {t.lastName}
                    </span>
                    <br />
                    <span className="appointment-info">
                      {appt.date}, {appt.time} — <strong>Done</strong>
                    </span>
                  </div>
                </div>
                <div className="action-buttons">
                  <button onClick={() => navigate(`/meeting/${appt.id}`)}>
                    Join
                  </button>
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
