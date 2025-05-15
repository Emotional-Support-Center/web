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
  const now = new Date();

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

  useEffect(() => {
    if (userData?.showWelcomePopup) {
      setShowPopup(true);
    }
  }, [userData]);

  useEffect(() => {
    fetchAppointments();
  }, [currentUser]);

  const handlePopupSave = updatedData => {
    setUserData(prev => ({ ...prev, ...updatedData }));
    setShowPopup(false);
  };

  const pending = appointments.filter(a => a.status === "pending");
  const payPending = appointments.filter(a => a.status === "waitingPayment");
  const done = appointments.filter(a => a.status === "done");

  // Stats
  const totalSessions = done.filter(a => {
    const [y, m, d] = a.date.split("-").map(Number);
    const [endHour, endMin] = a.time.split("-")[1].split(":").map(Number);
    const end = new Date(y, m - 1, d, endHour, endMin);
    return end < now;
  }).length;

  const upcoming = done.filter(a => {
    const [y, m, d] = a.date.split("-").map(Number);
    const [endHour, endMin] = a.time.split("-")[1].split(":").map(Number);
    const end = new Date(y, m - 1, d, endHour, endMin);
    return end > now;
  });

  const uniqueDoneTherapists = new Set(done.map(a => a.therapistId)).size;

  return (
      <div className="dashboard-content">
        <div className="top-cards">
          <div className="card">
            <h3>{totalSessions}</h3>
            <p>Total Sessions</p>
          </div>
          <div className="card">
            <h3>{upcoming.length}</h3>
            <p>Upcoming</p>
          </div>
          <div className="card">
            <h3>{uniqueDoneTherapists}</h3>
            <p>Therapists</p>
          </div>
        </div>

        <div className="appointment-sections">
          <section>
            <h3 className="section-title">Pending Approval</h3>
            {pending.map(appt => {
              const t = therapistMap[appt.therapistId] || {};
              return (
                  <div key={appt.id} className="request-card">
                    <div className="patient-info">
                      <img src={t.photoURL || "/default-avatar.png"} alt="" />
                      <div>
                        <span className="patient-name">{t.firstName} {t.lastName}</span><br />
                        <span className="appointment-info">{appt.date}, {appt.time}</span>
                      </div>
                    </div>
                  </div>
              );
            })}
          </section>

          <section>
            <h3 className="section-title">Unpaid Appointments</h3>
            {payPending.map(appt => {
              const t = therapistMap[appt.therapistId] || {};
              return (
                  <div key={appt.id} className="request-card">
                    <div className="patient-info">
                      <img src={t.photoURL || "/default-avatar.png"} alt="" />
                      <div>
                        <span className="patient-name">{t.firstName} {t.lastName}</span><br />
                        <span className="appointment-info">{appt.date}, {appt.time}</span>
                      </div>
                    </div>
                    <button className="pay-button" onClick={() => navigate(`/payment/${appt.id}`)}>Pay</button>
                  </div>
              );
            })}
          </section>

          <section>
            <h3 className="section-title">Upcoming Appointments</h3>
            {upcoming.map(appt => {
              const t = therapistMap[appt.therapistId] || {};
              const [y, m, d] = appt.date.split("-").map(Number);
              const [startHour, startMin] = appt.time.split("-")[0].split(":").map(Number);
              const [endHour, endMin] = appt.time.split("-")[1].split(":").map(Number);

              const start = new Date(y, m - 1, d, startHour, startMin);
              const end = new Date(y, m - 1, d, endHour, endMin);
              const isVirtual = appt.sessionType === "single virtual" || appt.sessionType === "group virtual";
              const isJoinable = isVirtual && now >= start && now < end;

              return (
                  <div key={appt.id} className="patient-card22">
                    <div className="patient-info">
                      <img src={t.photoURL || "/default-avatar.png"} alt="" />
                      <div>
                        <span className="patient-name">{t.firstName} {t.lastName}</span><br />
                        <span className="appointment-info">{appt.date}, {appt.time}</span>
                      </div>
                    </div>
                    {isJoinable && (
                        <div className="action-buttons">
                          <button onClick={() => navigate(`/meeting/${appt.id}`)}>Join</button>
                        </div>
                    )}
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
