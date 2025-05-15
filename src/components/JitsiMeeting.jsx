// src/components/JitsiMeeting.jsx
import React, { useEffect, useRef, useState } from 'react';
import '../css/JitsiMeeting.css';

function loadJitsiScript() {
  return new Promise((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) return resolve();
    const existing = document.getElementById('jitsi-api');
    if (existing) {
      existing.addEventListener('load', resolve);
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://meet.ffmuc.net/external_api.js';  // ← FFmuc no-lobby instance
    script.id = 'jitsi-api';
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function JitsiMeeting({ roomName, displayName, onEnd }) {
  const containerRef = useRef(null);
  const apiRef       = useRef(null);
  const [ready, setReady] = useState(false);

  // 1) load the public FFmuc API
  useEffect(() => {
    loadJitsiScript()
      .then(() => setReady(true))
      .catch(err => console.error('Failed to load Jitsi script', err));
  }, []);

  // 2) once loaded, spin up the meeting
  useEffect(() => {
    if (!ready || !containerRef.current) return;

    const domain = 'meet.ffmuc.net';      // ← use the FFmuc domain here
    const options = {
      roomName,
      parentNode: containerRef.current,
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'hangup',
          'chat', 'raisehand', 'tileview', 'fullscreen'
        ]
      },
      configOverwrite: {
        prejoinPageEnabled: false,      // skip the “join preview”
        disableDeepLinking: true
      },
      userInfo: { displayName }
    };

    const api = new window.JitsiMeetExternalAPI(domain, options);
    apiRef.current = api;

    api.addListener('videoConferenceLeft', () => {
      api.dispose();
      onEnd?.();
    });

    return () => api.dispose();
  }, [ready, roomName, displayName, onEnd]);

  if (!ready) {
    return (
      <div className="loading-placeholder">
        Loading meeting…
      </div>
    );
  }

  return (
    <div className="jitsi-page">
      <div className="jitsi-wrapper">
        <div ref={containerRef} className="jitsi-container" />
        <button
          className="jitsi-leave-button"
          onClick={() => apiRef.current?.executeCommand('hangup')}
        >
          Leave
        </button>
      </div>
    </div>
  );
}
