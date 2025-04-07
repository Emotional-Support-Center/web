// src/routes/AdminPage.jsx
import React from 'react';
import AdminLeftBar from '../components/adminLeftBar';
import '../css/AdminLayout.css';

const users = [
  { id: 1, name: 'Jane Doe', email: 'jane@example.com', status: 'Active' },
  { id: 2, name: 'John Smith', email: 'john@example.com', status: 'Suspended' },
  { id: 3, name: 'Emily Carter', email: 'emily@example.com', status: 'Pending' }
];

const stats = [
  { label: 'Total Users', value: '1,238' },
  { label: 'Monthly Visitors', value: '42,583' },
  { label: 'Content Reports', value: '67' }
];

const contents = [
  { id: 101, title: 'Coping with Anxiety', author: 'Dr. Alice', status: 'Pending' },
  { id: 102, title: 'Daily Mindfulness Tips', author: 'Therapist Mike', status: 'Approved' },
  { id: 103, title: 'Meditation for Sleep', author: 'Dr. Lin', status: 'Rejected' }
];

const notifications = [
  { id: 'n1', message: 'New user registered: Sarah Miles', time: '5 minutes ago' },
  { id: 'n2', message: 'Pending content needs review', time: '22 minutes ago' },
  { id: 'n3', message: 'System maintenance scheduled', time: '2 hours ago' }
];

const AdminPage = () => {
  return (
    <div className="admin-page">
      <AdminLeftBar />
      <div className="admin-content">
        <h1>Welcome, Admin</h1>

        <section className="admin-section">
          <h2>Overview</h2>
          <div className="stat-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-section">
          <h2>User Management</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="admin-section">
          <h2>Content Moderation</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {contents.map(item => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.author}</td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="admin-section">
          <h2>Notifications</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Message</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map(note => (
                <tr key={note.id}>
                  <td>{note.message}</td>
                  <td>{note.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
};

export default AdminPage;
