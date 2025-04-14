import React from 'react';
import { FaCalendarAlt, FaUserFriends, FaUserCircle, FaHome, FaTasks, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../css/Layout.css';
import { useAuth } from '../services/authContext';

const LeftBar = () => {
    const { userRole } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="sidebar-container">
            <ul className="sidebar-menu">
                <li onClick={() => navigate('/dashboard')}>
                    <FaHome className="icon" />
                    <span>Dashboard</span>
                </li>
                <li onClick={() => navigate('/appointments')}>
                    <FaCalendarAlt className="icon" />
                    <span>Schedule</span>
                </li>

                {userRole === "therapist" && (
                    <>

                        <li onClick={() => navigate('/mypage')}>
                            <FaUserCircle className="icon" />
                            <span>My Page</span>
                        </li>
                    </>
                )}

                {userRole === "patient" && (
                    <>
                        <li onClick={() => navigate('/therapists')}>
                            <FaSearch className="icon" />
                            <span>Find Therapist</span>
                        </li>

                        <li onClick={() => navigate('/patient-tasks')}>
                            <FaTasks className="icon" />
                            <span>My Tasks</span>
                        </li>
                    </>
                )}
            </ul>
        </div>
    );
};

export default LeftBar;
