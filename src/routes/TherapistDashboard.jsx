// src/routes/TherapistDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";                // ← import useNavigate
import TherapistInfoPopup from "../components/TherapistInfoPopup";
import { useAuth } from "../services/authContext";
import "../css/TherapistDashboard.css";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { approveAppointment, rejectAppointment } from "../services/appointmentService";

const TherapistDashboard = () => {
  const { currentUser, userData, setUserData } = useAuth();
  const navigate = useNavigate();                              // ← initialize navigate
  const [showPopup, setShowPopup] = useState(false);
  const [showCertWarning, setShowCertWarning] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [patientMap, setPatientMap] = useState({});

  // 1) Fetch all appointments + preload patient info
  const fetchAppointments = async () => {
    if (!currentUser?.uid) return;
    const q = query(
      collection(db, "appointments"),
      where("therapistId", "==", currentUser.uid)
    );
    const snap = await getDocs(q);
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setAppointments(list);

    const ids = [...new Set(list.map(a => a.patientId))];
    const map = {};
    await Promise.all(
      ids.map(async pid => {
        const psnap = await getDoc(doc(db, "patients", pid));
        if (psnap.exists()) {
          map[pid] = psnap.data();
        }
      })
    );
    setPatientMap(map);
  };

  // 2) Popups & warnings
  useEffect(() => {
    if (userData?.showWelcomePopup) setShowPopup(true);
  }, [userData]);

  useEffect(() => {
    setShowCertWarning(userData?.verified === false);
  }, [userData?.verified]);

  // 3) fetch on mount / user change
  useEffect(() => {
    fetchAppointments();
  }, [currentUser]);

  const handlePopupSave = async updatedData => {
    await updateDoc(doc(db, "therapists", currentUser.uid), {
      showWelcomePopup: false
    });
    setUserData(prev => ({
      ...prev,
      ...updatedData,
      showWelcomePopup: false
    }));
    setShowPopup(false);
  };
  const closeCertWarning = () => setShowCertWarning(false);

  // 4) categorize
  const pending    = appointments.filter(a => a.status === "pending");
  const payPending = appointments.filter(a => a.status === "waitingPayment");
  const approved   = appointments.filter(a => a.status === "approved");
  const done       = appointments.filter(a => a.status === "done");


  return (
    <div className="dashboard-layout">
      <div className="dashboard-main">
        {showCertWarning && (
          <div className="certificate-warning">
            <span>
              To verify your profile, please upload your certificate on{" "}
              <strong>Settings</strong>.
            </span>
            <button className="close-warning" onClick={closeCertWarning}>
              ×
            </button>
          </div>
        )}

        <div className="dashboard-content">
          <div className="top-cards">
            <div className="card">
              {/* Earnings: geçmişte bitmiş done appointmentların toplamı */}
              <h3>
                $
                {
                  appointments
                  .filter(a => a.status === "done")
                      .reduce((total, a) => total + parseInt(a.fee || 0), 0)}

                    </h3>
              <p>Earnings</p>
            </div>

            <div className="card">
              <h3>
                {
                  appointments
                      .filter(a => a.status === "done")
                      .filter(a => {
                        const [year, month, day] = a.date.split("-").map(Number);
                        const [endHour, endMinute] = a.time.split("-")[1].split(":").map(Number);
                        const appointmentEnd = new Date(year, month - 1, day, endHour, endMinute);
                        return new Date() < appointmentEnd;
                      }).length
                }
              </h3>
              <p>Appointments</p>
            </div>


            <div className="card">
              {/* Patients: unique patientId from done appointments */}
              <h3>
                {
                  new Set(
                      appointments
                          .filter(a => a.status === "done")
                          .map(a => a.patientId)
                  ).size
                }
              </h3>
              <p>Patients</p>
            </div>
          </div>

          <div className="appointment-sections">
            <section>
              <h2 className="section-title">Patient Requests</h2>
              {pending.map(appt => {
                const p = patientMap[appt.patientId] || {};
                return (
                  <div key={appt.id} className="request-card">
                    <div className="patient-info">
                      <img
                        src={p.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                        alt="Profile"
                      />
                      <div>
                        <span className="patient-name">
                          {p.firstName} {p.lastName}
                        </span>
                        <br />
                        <span className="appointment-info">
                          {appt.date}, {appt.time}
                        </span>
                      </div>
                    </div>
                    <div className="request-buttons">
                      <button
                        className="approve"
                        onClick={async () => {
                          await approveAppointment(appt.id, appt.therapistId, appt.patientId);
                          await fetchAppointments();
                        }}
                      >
                        Approve
                      </button>
                      <button
                        className="reject"
                        onClick={async () => {
                          await rejectAppointment(appt.id, appt.therapistId, appt.patientId);
                          await fetchAppointments();
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </section>

            <section>
              <h2 className="section-title">Unpaid Appointments</h2>
              {payPending.map(appt => {
                const p = patientMap[appt.patientId] || {};
                return (
                  <div key={appt.id} className="request-card">
                    <div className="patient-info">
                      <img
                        src={p.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                        alt="Profile"
                      />
                      <div>
                        <span className="patient-name">
                          {p.firstName} {p.lastName}
                        </span>
                        <br />
                        <span className="appointment-info">
                          {appt.date}, {appt.time}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>

            <section>
              <h2 className="section-title">Current Appointments</h2>
              {done
                  .filter(appt => {
                    const [year, month, day] = appt.date.split("-").map(Number);
                    const [endHour, endMinute] = appt.time.split("-")[1].split(":").map(Number);
                    const appointmentEnd = new Date(year, month - 1, day, endHour, endMinute);
                    return new Date() <= appointmentEnd;
                  })
                  .map(appt => {
                    const p = patientMap[appt.patientId] || {};
                    const [year, month, day] = appt.date.split("-").map(Number);
                    const [startHour, startMinute] = appt.time.split("-")[0].split(":").map(Number);
                    const [endHour, endMinute] = appt.time.split("-")[1].split(":").map(Number);

                    const appointmentStart = new Date(year, month - 1, day, startHour, startMinute);
                    const appointmentEnd = new Date(year, month - 1, day, endHour, endMinute);
                    const now = new Date();

                    const isVirtual = appt.sessionType === "single virtual" || appt.sessionType === "group virtual";
                    const showJoinButton = isVirtual && now >= new Date(appointmentStart.getTime() - 5 * 60000) && now <= appointmentEnd;

                    return (
                        <div key={appt.id} className="patient-card31">
                          <div className="patient-info">
                            <img
                                src={p.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                alt="Profile"
                            />
                            <div>
                              <span className="patient-name">{p.firstName} {p.lastName}</span>
                              <br />
                              <span className="appointment-info">{appt.date}, {appt.time}</span>
                            </div>
                          </div>

                          {showJoinButton && (
                              <div className="action-buttons">
                                <button onClick={() => navigate(`/meeting/${appt.id}`)}>Join</button>
                              </div>
                          )}
                        </div>
                    );
                  })}
            </section>



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
