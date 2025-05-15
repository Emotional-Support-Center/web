// src/routes/AdminPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLeftBar from '../components/adminLeftBar.jsx';
import { db } from '../firebase/firebase';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import '../css/AdminLayout.css';

const AdminPage = () => {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [contents, setContents] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin !== 'true') {
      navigate('/adminAuth');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      const patientSnapshot = await getDocs(collection(db, 'patients'));
      const therapistSnapshot = await getDocs(collection(db, 'therapists'));
      const contentSnapshot = await getDocs(collection(db, 'contents'));
      const reviewSnapshot = await getDocs(collection(db, 'reviews'));

      setPatients(patientSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTherapists(therapistSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setContents(contentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setReviews(reviewSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchData();
  }, []);

  const handleApproveCertificate = async (therapistId) => {
    try {
      await updateDoc(doc(db, 'therapists', therapistId), { verified: true });
      setTherapists(prev => prev.map(t => t.id === therapistId ? { ...t, verified: true } : t));
      setSuccessMessage('Therapist verified successfully!');
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error('Error verifying therapist:', error);
      setSuccessMessage('Failed to verify therapist.');
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      setSuccessMessage('Review deleted successfully!');
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error('Error deleting review:', error);
      setSuccessMessage('Failed to delete review.');
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/adminAuth');
  };

  const totalUsers = patients.length + therapists.length;

  return (
    <div className="admin-page">
      <AdminLeftBar />
      <div className="admin-content">
        <div className="admin-header">
          <h1>Welcome, Admin</h1>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>

        {successMessage && <div className="success-message">{successMessage}</div>}

        <section className="admin-section">
          <h2>Overview</h2>
          <div className="stat-grid">
            <div className="stat-card">
              <h3>{totalUsers}</h3>
              <p>Total Users</p>
            </div>
            <div className="stat-card">
              <h3>{patients.length}</h3>
              <p>Total Patients</p>
            </div>
            <div className="stat-card">
              <h3>{therapists.length}</h3>
              <p>Total Therapists</p>
            </div>
          </div>
        </section>

        <section className="admin-section">
          <h2>User Management</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(user => (
                <tr key={user.id}>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td>Patient</td>
                </tr>
              ))}
              {therapists.map(user => (
                <tr key={user.id}>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td>Therapist</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="admin-section">
          <h2>Certificate Verification</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Certificate</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {therapists.map(therapist => (
                <tr key={therapist.id}>
                  <td>{therapist.firstName} {therapist.lastName}</td>
                  <td><a href={therapist.certificateURL} target="_blank" rel="noopener noreferrer">View Certificate</a></td>
                  <td>{therapist.verified ? 'Verified' : 'Pending'}</td>
                  <td>
                    {!therapist.verified && (
                      <button onClick={() => handleApproveCertificate(therapist.id)}>Approve</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="admin-section">
          <h2>Review Management</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Comment</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(review => (
                <tr key={review.id}>
                  <td>{review.user?.name || 'Unknown'} {review.user?.surname || ''}</td>
                  <td>{review.content}</td>
                  <td>{new Date(review.createdAt).toLocaleString()}</td>
                  <td>
                    <button onClick={() => handleDeleteReview(review.id)}>Delete</button>
                  </td>
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
                  <td>{item.authorName || 'Unknown'}</td>
                  <td>{item.status || 'Pending'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="admin-section">
          <h2>Notifications</h2>
          <p>Notification system not implemented yet.</p>
        </section>
      </div>
    </div>
  );
};

export default AdminPage;