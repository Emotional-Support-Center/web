import React, { useState } from "react";
import "../css/TherapistLayout.css";
import { useAuth } from "../services/authContext";
import { FaChevronDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const HeadBarTherapist = () => {
    const { handleLogout, userData } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

    const profileImage = userData?.photoURL
        ? userData.photoURL
        : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    const fullName =
        userData?.firstName && userData?.lastName
            ? `${userData.firstName} ${userData.lastName}`
            : "Therapist";

    return (
        <div className="headbar">
            <div
                className="headbar-title"
                onClick={() => navigate("/dashboard")}
                style={{ cursor: "pointer" }}
            >
                Emotional Support Center
            </div>

            <div className="profile-area" onClick={toggleDropdown}>
                <img
                    src={profileImage}
                    alt="Profile"
                    className="profile-img"
                />
                <span className="profile-name">
                    {fullName}
                    <FaChevronDown className="dropdown-icon" />
                </span>

                {dropdownOpen && (
                    <div className="dropdown-menu">
                        <button onClick={() => navigate("/settings")}>Settings</button>
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HeadBarTherapist;
