import React from 'react';
import '../css/AdminLayout.css';

const AdminLeftBar = () => {
  return (
    <div className="admin-leftbar">
      <h2>Admin Panel</h2>
      <ul>
        <li>Dashboard</li>
        <li>Users</li>
        <li>Statistics</li>
        <li>Content</li>
        <li>Notifications</li>
        <li>Log Out</li>
      </ul>
    </div>
  );
};

export default AdminLeftBar;