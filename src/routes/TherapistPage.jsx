import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import {
  doc, getDoc, updateDoc, collection,
  query, where, getDocs, setDoc
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../services/authContext";
import { createAppointment } from "../services/appointmentService";
import Comments from "../TherapistComments/Comments";
import "../css/TherapistPage.css";

const TherapistPage = () => {
  const { userData, userRole, currentUser } = useAuth();
  const { id } = useParams();

  const [therapist, setTherapist] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [userRating, setUserRating] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [sessionType, setSessionType] = useState("");

  const isViewingAnother = Boolean(id);
  const therapistData = isViewingAnother ? therapist : userData;
  const therapistId = isViewingAnother ? id : currentUser?.uid;

  const fetchAvailableSlots = async () => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0]; // "2025-05-15"

    const q = query(
        collection(db, "availability"),
        where("therapistId", "==", therapistId),
        where("status", "==", "available")
    );

    const snapshot = await getDocs(q);
    const slots = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(slot => {
          const [y, m, d] = slot.date.split("-").map(n => n.padStart?.(2, '0') ?? n);
          const normalized = `${y}-${m}-${d}`;
          return normalized >= todayStr;
        });

    setAvailableSlots(slots);
  };



  useEffect(() => {
    const fetchTherapistData = async () => {
      if (!therapistId) return;
      const therapistRef = doc(db, "therapists", therapistId);
      const snap = await getDoc(therapistRef);
      if (snap.exists()) {
        setTherapist({ id: therapistId, ...snap.data() });
      }
    };

    const fetchRating = async () => {
      if (!currentUser) return;
      const q = query(
          collection(db, "ratings"),
          where("userId", "==", currentUser.uid),
          where("therapistId", "==", therapistId)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setUserRating(snapshot.docs[0].data().rating);
      }
    };

    if (isViewingAnother) {
      fetchTherapistData();
      fetchRating();
      fetchAvailableSlots();
    }
  }, [id, therapistId, currentUser]);

  const handleRatingSubmit = async (value) => {
    if (userRole !== "patient" || !currentUser) return;
    const ratingRef = doc(db, "ratings", `${currentUser.uid}_${therapistId}`);
    await setDoc(ratingRef, {
      userId: currentUser.uid,
      therapistId,
      rating: value
    });

    const q = query(collection(db, "ratings"), where("therapistId", "==", therapistId));
    const snapshot = await getDocs(q);
    const ratings = snapshot.docs.map(doc => doc.data().rating);
    const average = (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1);

    await updateDoc(doc(db, "therapists", therapistId), {
      rating: parseFloat(average),
      voteCount: ratings.length
    });

    setUserRating(value);
    setTherapist(prev => ({ ...prev, rating: parseFloat(average), voteCount: ratings.length }));
  };

  const handleBooking = async () => {
    if (!selectedSlot || !sessionType) return;

    let fee = 0;
    switch (sessionType) {
      case "single virtual":
        fee = therapistData?.feeIndividual;
        break;
      case "group virtual":
        fee = therapistData?.feeGroup;
        break;
      case "single face-to-face":
        fee = therapistData?.feeIndividual;
        break;
      case "group face-to-face":
        fee = therapistData?.feeGroup;
        break;
      default:
        fee = 0;
    }

    await createAppointment({
      therapistId,
      patientId: currentUser.uid,
      date: selectedSlot.date,
      time: selectedSlot.time,
      sessionType,
      fee
    });

    alert("Appointment request sent!");
    setSelectedSlot(null);
    fetchAvailableSlots();
  };


  const totalRating = therapistData?.rating || 0;
  const totalVotes = therapistData?.voteCount || 0;

  const uniqueDates = [...new Set(availableSlots.map(slot => slot.date))];
  const filteredByDate = selectedDate ? availableSlots.filter(slot => slot.date === selectedDate) : [];
  const filteredSlots = sessionType ? filteredByDate.filter(slot => slot.sessionType === sessionType) : [];

  return (
      <div className="dashboard-layout">
        <div className="dashboard-main">
          <div className="mypage-container">

            <div className="therapist-profile">
              <img
                  src={therapistData?.photoURL || "/default-avatar.png"}
                  alt="Therapist"
                  className="therapist-photo"
              />
              <div className="therapist-info">
                <div className="top-info">
                  <div className="name-and-verification">
                    <h2>{`Dr. ${therapistData?.firstName || ""} ${therapistData?.lastName || ""}`}</h2>
                    <div className={`verification-badge ${therapistData?.verified ? "verified" : "not-verified"}`}>
                      {therapistData?.verified ? "Verified" : "Not Verified"}
                    </div>
                  </div>
                  <div className="rating-stars">
                    {[...Array(5)].map((_, i) => (
                        <FaStar
                            key={i}
                            color={(hoverRating || userRating || 0) > i ? "#ffc107" : "#e4e5e9"}
                            onMouseEnter={() => userRole === "patient" && setHoverRating(i + 1)}
                            onMouseLeave={() => userRole === "patient" && setHoverRating(0)}
                            onClick={() => handleRatingSubmit(i + 1)}
                            style={{ cursor: userRole === "patient" ? "pointer" : "default" }}
                        />
                    ))}
                    <span className="rating-text">
                    {totalRating.toFixed(1)} <span className="vote-count">({totalVotes} votes)</span>
                  </span>
                  </div>
                </div>

                <div className="details-info">
                  <p><strong>Specialities:</strong> {therapistData?.specialties}</p>
                  <p><strong>Languages:</strong> {therapistData?.languages}</p>
                  <p><strong>Location:</strong> {therapistData?.location}</p>
                  <div className="about">
                    <strong>About</strong>
                    <p>{therapistData?.about || "No bio available."}</p>
                  </div>
                  <p className="fee">Individual fee: ${therapistData?.feeIndividual || "0"}</p>
                  <p className="fee">Group fee: ${therapistData?.feeGroup || "0"}</p>
                </div>
              </div>
            </div>

            {userRole === "patient" && isViewingAnother && (
                <div className="booking-section">
                  <h3>Available Slots</h3>

                  <div className="day-selector">
                    {uniqueDates.map((date, index) => (
                        <div
                            key={index}
                            className={`day-bubble ${selectedDate === date ? "selected" : ""}`}
                            onClick={() => {
                              setSelectedDate(date);
                              setSessionType("");
                              setSelectedSlot(null);
                            }}
                        >
                          {new Date(date).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          })}
                        </div>
                    ))}
                  </div>

                  {selectedDate && (
                      <select
                          className="session-type-select"
                          value={sessionType}
                          onChange={(e) => {
                            setSessionType(e.target.value);
                            setSelectedSlot(null);
                          }}
                      >
                        <option value="">Select session type</option>
                        <option value="single virtual">Single Virtual</option>
                        <option value="group virtual">Group Virtual</option>
                        <option value="single face-to-face">Single Face-to-Face</option>
                        <option value="group face-to-face">Group Face-to-Face</option>
                      </select>
                  )}

                  {sessionType && (
                      <div className="slot-selector">
                        {filteredSlots.length > 0 ? (
                            filteredSlots.map((slot, index) => (
                                <button
                                    key={index}
                                    className={`slot-btn ${selectedSlot?.id === slot.id ? "selected-slot" : ""}`}
                                    onClick={() => setSelectedSlot(slot)}
                                >
                                  {slot.time}
                                </button>
                            ))
                        ) : (
                            <p>No slots available for this session type.</p>
                        )}
                      </div>
                  )}

                  {selectedSlot && (
                      <button className="book-btn" onClick={handleBooking}>
                        Book Appointment
                      </button>
                  )}
                </div>
            )}

            <div className="reviews-section">
              <Comments therapistId={therapistId} />
            </div>
          </div>
        </div>
      </div>
  );
};

export default TherapistPage;
