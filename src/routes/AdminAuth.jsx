// src/routes/AdminAuth.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebase'; // Firebase bağlantı dosyanı import et
import { collection, getDocs } from 'firebase/firestore';

const AdminAuth = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const adminRef = collection(db, 'admin');
      const snapshot = await getDocs(adminRef);

      let loginSuccess = false;

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.username === username && data.password === password) {
          loginSuccess = true;
        }
      });

      if (loginSuccess) {
        console.log('oldu');
        localStorage.setItem('isAdmin', 'true');
        navigate('/adminPanel');
      } else {
        setError('Invalid username or password.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      backgroundColor: '#f9f9f9'
    }}>
      <form onSubmit={handleLogin} style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '10px', 
        background: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)'
      }}>
        <h2>Admin Login</h2>
        {error && <div style={{ color: 'red' }}>{error}</div>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ padding: '10px', fontSize: '16px' }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '10px', fontSize: '16px' }}
        />

        <button type="submit" style={{
          padding: '10px',
          fontSize: '16px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          cursor: 'pointer'
        }}>
          Login
        </button>
      </form>
    </div>
  );
};

export default AdminAuth;
