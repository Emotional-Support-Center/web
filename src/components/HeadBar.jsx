import React, { useState, useRef, useEffect } from "react";
import "../css/Layout.css";
import { useAuth } from "../services/authContext";
import { FaChevronDown, FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import Notification from "./Notification";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";

const HeadBar = () => {
    const { handleLogout, userData, userRole } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [hasNotifications, setHasNotifications] = useState(false);
    const navigate = useNavigate();
    const notificationRef = useRef(null);

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

    const profileImage = userData?.photoURL
        ? userData.photoURL
        : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    const fullName =
        userData?.firstName && userData?.lastName
            ? `${userData.firstName} ${userData.lastName}`
            : "User";

    const handleSettingsRedirect = () => {
        if (userRole === "therapist") {
            navigate("/settings");
        } else if (userRole === "patient") {
            navigate("/settings?role=patient");
        }
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(e.target)
            ) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const checkNotifications = async () => {
            if (!userData?.uid) return;
            const q = query(collection(db, "notifications"), where("userId", "==", userData.uid));
            const snapshot = await getDocs(q);
            setHasNotifications(snapshot.docs.length > 0);
        };
        checkNotifications();
    }, [userData]);

    return (
        <div className="headbar">
            <div
                className="headbar-title"
                onClick={() => navigate("/dashboard")}
                style={{ cursor: "pointer" }}
            >
                Emotional Support Center
            </div>

            {userRole === "patient" && <SearchBar />}

            <div className="headbar-right">
                <div className="notification-icon-wrapper" ref={notificationRef}>
                    <FaBell
                        className="notification-icon"
                        onClick={() => setShowNotifications(!showNotifications)}
                        title="Notifications"
                    />
                    {hasNotifications && <span className="notification-alert-dot"></span>}
                    {showNotifications && <Notification />}
                </div>

                <div className="profile-area" onClick={toggleDropdown}>
                    <img src={profileImage} alt="Profile" className="profile-img" />
                    <span className="profile-name">
                        {fullName}
                        <FaChevronDown className="dropdown-icon" />
                    </span>

                    {dropdownOpen && (
                        <div className="dropdown-menu">
                            <button onClick={handleSettingsRedirect}>Settings</button>
                            <button onClick={handleLogout}>Logout</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HeadBar;
