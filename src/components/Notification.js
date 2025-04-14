import React, { useEffect, useState } from "react";
import "../css/Notification.css";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../services/authContext";
import { useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";

const Notification = () => {
    const { currentUser, userRole } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        if (!currentUser) return;

        const q = query(collection(db, "notifications"), where("userId", "==", currentUser.uid));
        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        const sorted = data.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
        setNotifications(sorted);
    };

    const handleDelete = async (id) => {
        await deleteDoc(doc(db, "notifications", id));
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const handleRedirect = () => {

            navigate("/dashboard");

    };

    useEffect(() => {
        fetchNotifications();
    }, [currentUser]);

    return (
        <div className="notification-popup">
            <h3>Notifications</h3>
            {notifications.length === 0 ? (
                <p className="no-notifications">No notifications</p>
            ) : (
                <ul className="notification-list">
                    {notifications.map((n) => (
                        <li key={n.id} className="notification-item">
                            <div className="notification-content" onClick={() => handleRedirect()}>
                                <img src={n.photoURL || "/default-avatar.png"} alt="pp" className="notification-avatar" />
                                <div>
                                    <span className="notification-name">
                                        {n.fullName || `${n.firstName || ""} ${n.lastName || ""}`}
                                    </span>{" "}
                                    <span className="notification-message">{n.message}</span>
                                </div>
                            </div>
                            <FaTimes className="delete-icon" onClick={() => handleDelete(n.id)} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Notification;
