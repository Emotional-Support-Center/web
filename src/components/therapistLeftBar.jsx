import React from 'react';
import { FaCalendarAlt, FaUserFriends, FaUserCircle, FaHome } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../css/TherapistLayout.css';

const LeftbarTherapist = () => {
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
                    <span>Upcoming Appointments</span>
                </li>
                <li onClick={() => navigate('/dashboard/patients')}>
                    <FaUserFriends className="icon" />
                    <span>My Patients</span>
                </li>
                <li onClick={() => navigate('/mypage')}>
                    <FaUserCircle className="icon" />
                    <span>My Page</span>
                </li>
            </ul>
        </div>
    );
};

export default LeftbarTherapist;
