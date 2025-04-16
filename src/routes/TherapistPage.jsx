import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../css/TherapistPage.css";
import { useAuth } from "../services/authContext";
import { FaStar } from "react-icons/fa";
import Comments from "../TherapistComments/Comments";
import {
    doc, getDoc, updateDoc,
    collection, query, where, getDocs, setDoc
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import {createAppointment} from "../services/appointmentService";

const TherapistPage = () => {
    const { userData, userRole, currentUser } = useAuth();
    const { id } = useParams();
    const [therapist, setTherapist] = useState(null);
    const [selectedDateIndex, setSelectedDateIndex] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [hoverRating, setHoverRating] = useState(0);
    const [userRating, setUserRating] = useState(null);
    const [availableDates, setAvailableDates] = useState([]);
    const [availability, setAvailability] = useState({});

    const isViewingAnother = Boolean(id);
    const therapistData = isViewingAnother ? therapist : userData;
    const therapistId = isViewingAnother ? id : currentUser?.uid;

    useEffect(() => {
        const fetchTherapist = async () => {
            const ref = doc(db, "therapists", therapistId);
            const snap = await getDoc(ref);
            if (snap.exists()) {
                setTherapist({ id: therapistId, ...snap.data() });
            }
        };

        const fetchUserRating = async () => {
            if (!currentUser || !therapistId) return;
            const ratingsRef = collection(db, "ratings");
            const q = query(ratingsRef,
                where("userId", "==", currentUser.uid),
                where("therapistId", "==", therapistId));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                setUserRating(snapshot.docs[0].data().rating);
            }
        };

        const fetchAvailability = async () => {
            if (!therapistId) return;
            const ref = doc(db, "availability", therapistId);
            const snap = await getDoc(ref);
            if (snap.exists()) {
                const data = snap.data();
                const today = new Date().toISOString().split("T")[0];
                const upcomingDates = Object.keys(data)
                    .filter(date => new Date(date) >= new Date(today))
                    .sort((a, b) => new Date(a) - new Date(b));
                setAvailableDates(upcomingDates);
                setAvailability(data);
            }
        };

        if (isViewingAnother) {
            fetchTherapist();
            fetchUserRating();
            fetchAvailability();
        }
    }, [id, therapistId, currentUser]);

    const formatDate = (isoDateStr) => {
        const options = { month: 'short', day: 'numeric' };
        return new Date(isoDateStr).toLocaleDateString('en-US', options);
    };

    const handleDayClick = (index) => {
        setSelectedDateIndex(index);
        setSelectedSlot(null);
    };

    const resetSelection = () => {
        setSelectedDateIndex(null);
        setSelectedSlot(null);
    };

    const selectedDate = selectedDateIndex !== null ? availableDates[selectedDateIndex] : null;
    const availableSlots = selectedDate ? availability[selectedDate]?.available || [] : [];

    const totalRating = therapistData?.rating || 0;
    const totalVotes = therapistData?.voteCount || 0;

    const handleRatingSubmit = async (value) => {
        if (userRole !== "patient" || !isViewingAnother || !currentUser) return;
        try {
            const ratingDocRef = doc(db, "ratings", `${currentUser.uid}_${therapistId}`);
            await setDoc(ratingDocRef, {
                userId: currentUser.uid,
                therapistId: therapistId,
                rating: value,
            });

            const q = query(collection(db, "ratings"), where("therapistId", "==", therapistId));
            const snapshot = await getDocs(q);
            const ratings = snapshot.docs.map(doc => doc.data().rating);
            const average = (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1);

            await updateDoc(doc(db, "therapists", therapistId), {
                rating: parseFloat(average),
                voteCount: ratings.length,
            });

            setUserRating(value);
            setTherapist(prev => ({ ...prev, rating: parseFloat(average), voteCount: ratings.length }));
        } catch (err) {
            console.error("Rating update failed", err);
        }
    };

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
                                            onMouseEnter={() =>
                                                userRole === "patient" && isViewingAnother && setHoverRating(i + 1)
                                            }
                                            onMouseLeave={() =>
                                                userRole === "patient" && isViewingAnother && setHoverRating(0)
                                            }
                                            onClick={() => handleRatingSubmit(i + 1)}
                                            style={{
                                                cursor: userRole === "patient" && isViewingAnother ? "pointer" : "default",
                                            }}
                                        />
                                    ))}
                                    <span className="rating-text">
                    {totalRating.toFixed(1)}{" "}
                                        <span className="vote-count">({totalVotes} votes)</span>
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
                            <h3>Booking Slots</h3>
                            <div className="day-selector" style={{ overflowX: "auto", display: "flex", gap: "12px" }}>
                                {availableDates.map((d, i) => (
                                    <div
                                        key={i}
                                        className={`day-bubble ${i === selectedDateIndex ? "selected" : ""}`}
                                        onClick={() => handleDayClick(i)}
                                    >
                                        {formatDate(d)}
                                    </div>
                                ))}
                            </div>

                            {selectedDateIndex !== null && (
                                <div className="slot-selector">
                                    {availableSlots.length > 0 ? (
                                        availableSlots.map((hour, idx) => (
                                            <button
                                                key={idx}
                                                className={`slot-btn ${selectedSlot === idx ? "selected-slot" : ""}`}
                                                onClick={() => setSelectedSlot(idx)}
                                            >
                                                {hour}
                                            </button>
                                        ))
                                    ) : (
                                        <p>No available slots for this day.</p>
                                    )}
                                </div>
                            )}

                            {selectedSlot !== null && (
                                <button
                                    className="book-btn"
                                    onClick={() =>
                                        createAppointment({
                                            therapistId,
                                            patientId: currentUser.uid,
                                            date: selectedDate,
                                            time: availableSlots[selectedSlot],
                                            fee: therapistData?.feeIndividual,
                                            availability,
                                            setAvailability,
                                            resetSelection,
                                        })
                                    }
                                >
                                    Book an appointment
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
