// src/routes/MeetingPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import JitsiMeeting from '../components/JitsiMeeting';

export default function MeetingPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, 'appointments', appointmentId));
      if (!snap.exists()) {
        return navigate('/dashboard'); // fallback if missing
      }
      setAppointment({ id: snap.id, ...snap.data() });
      setLoading(false);
    })();
  }, [appointmentId]);

  if (loading) {
    return <div style={{padding: 20}}>Loading meeting info…</div>;
  }

  // use the appointmentId as room name (or any consistent string)
  const roomName    = `room-${appointment.id}`;
  const displayName = appointment.patientId; // or pull currentUser.displayName

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <JitsiMeeting
        roomName={roomName}
        displayName={displayName}
        onEnd={() => navigate('/dashboard')}
      />
    </div>
  );
}
