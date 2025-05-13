// src/components/JitsiMeeting.jsx
import React, { useEffect, useRef, useState } from 'react';
import '../css/JitsiMeeting.css';

function loadJitsiScript() {
  return new Promise((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) return resolve();
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
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

  useEffect(() => {
    loadJitsiScript()
      .then(() => setReady(true))
      .catch(err => console.error('Jitsi script load failed', err));
  }, []);

  useEffect(() => {
    if (!ready || !containerRef.current) return;

    const domain = 'meet.jit.si';
    const options = {
      roomName,
      parentNode: containerRef.current,
      interfaceConfigOverwrite: {
        // only show these toolbar buttons
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'hangup',
          'chat', 'raisehand', 'tileview', 'fullscreen'
        ]
      },
      configOverwrite: {
        // skip the “preview” page entirely
        prejoinPageEnabled: false,
        // turn off any “waiting for moderator” lobby
        lobbyEnabled: false,
        // disable deep-linking prompts
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
    return <div className="loading-placeholder">Loading meeting…</div>;
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
