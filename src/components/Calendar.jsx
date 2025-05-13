import React, { useEffect, useMemo, useRef, useState } from 'react';
import '../css/Calendar.css';
import { db } from '../firebase/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc as firestoreDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { useAuth } from '../services/authContext';

const monthNames = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const defaultTimeSlots = [
  '09:00-10:00','10:00-11:00','11:00-12:00',
  '13:00-14:00','14:00-15:00','15:00-16:00'
];

const sessionTypes = [
  'single virtual','group virtual','single face-to-face','group face-to-face'
];

const Calendar = ({ isTherapist }) => {
  const { currentUser, userRole } = useAuth();
  const today = new Date();
  const dayRefs = useRef([]);
  const [year] = useState(today.getFullYear());
  const [slotsByDate, setSlotsByDate] = useState({});
  const [popupDay, setPopupDay] = useState(null);
  const [customSlot, setCustomSlot] = useState({ start:'', end:'', value:'', sessionType:'' });
  const [confirmModal, setConfirmModal] = useState({ show:false, id:null, time:'', status:'' });

  useEffect(() => {
    scrollToToday();
    if (isTherapist) fetchTherapistCalendar();
    else fetchPatientCalendar();

    const handleOutside = e => {
      if (!e.target.closest('.calendar-day') && !e.target.closest('.popup-selector')) {
        setPopupDay(null);
        setCustomSlot({ start:'',end:'',value:'',sessionType:'' });
      }
    };
    document.addEventListener('click', handleOutside);
    return () => document.removeEventListener('click', handleOutside);
  }, []);

  const scrollToToday = () => {
    const idx = dayRefs.current.findIndex(ref =>
      ref &&
      +ref.getAttribute('data-month') === today.getMonth() &&
      +ref.getAttribute('data-day') === today.getDate()
    );
    if (idx >= 0) dayRefs.current[idx].scrollIntoView({ behavior:'smooth', block:'center' });
  };

  // Therapist: availability + busy + done appointments
  const fetchTherapistCalendar = async () => {
    if (!currentUser) return;
    const map = {};

    // availability / busy
    let q = query(
      collection(db,'availability'),
      where('therapistId','==',currentUser.uid)
    );
    (await getDocs(q)).forEach(snap => {
      const { date, time, status } = snap.data();
      map[date] = map[date]||[];
      map[date].push({ time, status, id:snap.id });
    });

    // completed ("done") appointments
    q = query(
      collection(db,'appointments'),
      where('therapistId','==',currentUser.uid),
      where('status','==','done')
    );
    (await getDocs(q)).forEach(snap => {
      const { date, time } = snap.data();
      map[date] = map[date]||[];
      map[date].push({ time, status:'appointment', id:snap.id });
    });

    // sort slots
    Object.keys(map).forEach(d =>
      map[d].sort((a,b)=> a.time.localeCompare(b.time))
    );
    setSlotsByDate(map);
  };

  // Patient: all own appointments
  const fetchPatientCalendar = async () => {
    if (!currentUser) return;
    const map = {};
    const q = query(
      collection(db,'appointments'),
      where('patientId','==',currentUser.uid)
    );
    (await getDocs(q)).forEach(snap => {
      const { date, time, status } = snap.data();
      map[date] = map[date]||[];
      map[date].push({ time, status, id:snap.id });
    });
    Object.keys(map).forEach(d =>
      map[d].sort((a,b)=> a.time.localeCompare(b.time))
    );
    setSlotsByDate(map);
  };

  // Therapist: add / update slot
  const handleAddSlot = async (status='available') => {
    if (!popupDay) return;
    const { day, month, year } = popupDay;
    const dateStr = `${year}-${month+1}-${day}`;
    const slotStr = customSlot.value
      || (customSlot.start && customSlot.end && `${customSlot.start}-${customSlot.end}`)
      || '';
    if (!slotStr || !customSlot.sessionType) {
      return alert('Fill all slot fields');
    }

    // conflict check
    const [s,e] = slotStr.split('-');
    const [yh,mh,dh] = dateStr.split('-').map(Number);
    const newS = new Date(yh,mh-1,dh,...s.split(':').map(Number));
    const newE = new Date(yh,mh-1,dh,...e.split(':').map(Number));
    const conflict = (slotsByDate[dateStr]||[]).some(({time})=>{
      const [os,oe] = time.split('-');
      const oS = new Date(yh,mh-1,dh,...os.split(':').map(Number));
      const oE = new Date(yh,mh-1,dh,...oe.split(':').map(Number));
      return newS < oE && oS < newE;
    });
    if (conflict) return alert('Time overlap!');

    // upsert
    let q = query(
      collection(db,'availability'),
      where('therapistId','==',currentUser.uid),
      where('date','==',dateStr),
      where('time','==',slotStr)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docId = snap.docs[0].id;
      await updateDoc(doc(db,'availability',docId), {
        status,
        sessionType: customSlot.sessionType
      });
    } else {
      await addDoc(collection(db,'availability'), {
        therapistId: currentUser.uid,
        date: dateStr,
        time: slotStr,
        status,
        sessionType: customSlot.sessionType
      });
    }
    fetchTherapistCalendar();
    setCustomSlot({ start:'',end:'',value:'',sessionType:'' });
  };

  // Therapist: delete slot
  const handleDeleteSlot = async () => {
    await deleteDoc(firestoreDoc(db,'availability',confirmModal.id));
    setConfirmModal({ show:false,id:null,time:'',status:'' });
    fetchTherapistCalendar();
  };

  // build months → weeks grid
  const weeks = useMemo(() => {
    const days = [];
    for (let m=0;m<12;m++){
      const dim = new Date(year,m+1,0).getDate();
      for (let d=1;d<=dim;d++) days.push({month:m,day:d});
    }
    const rows = [];
    for (let i=0;i<days.length;i+=7) rows.push(days.slice(i,i+7));
    return rows;
  }, [year]);

  return (
    <div className="calendar-container">
      <div className="calendar-days-of-week">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d =>
          <div key={d}>{d}</div>
        )}
      </div>

      {weeks.map((week, wi) =>
        <div className="calendar-week" key={wi}>
          {week.map(({month,day}, di) => {
            const dateStr = `${year}-${month+1}-${day}`;
            const isToday =
              today.getFullYear()===year &&
              today.getMonth()===month &&
              today.getDate()===day;
            const isPast = new Date(year,month,day) < today && !isToday;
            const slots = slotsByDate[dateStr]||[];

            return (
              <div
                key={`${month}-${day}`}
                data-month={month}
                data-day={day}
                ref={el=>dayRefs.current[wi*7+di]=el}
                className={`calendar-day ${isPast?'past':''}`}
                onClick={e=>{
                  if (isTherapist && userRole==='therapist') {
                    const clicked = new Date(year,month,day);
                    if (clicked>=today || clicked.toDateString()===today.toDateString()) {
                      setPopupDay({ month, day, year });
                    }
                  }
                }}
              >
                <span className={`calendar-day-number ${isToday?'today':''}`}>
                  {day}
                </span>
                {day===1 && (
                  <span className="new-month-label">
                    {monthNames[month]}
                  </span>
                )}

                <div className="slot-indicators">
                  {slots.map(({time,status,id}, i) => (
                    <div
                      key={i}
                      className={`slot-dot ${status}`}
                      onClick={isTherapist
                        ? e=>{ e.stopPropagation(); setConfirmModal({ show:true,id,time,status }); }
                        : undefined
                      }
                    >
                      <div className="slot-tooltip">
                        {status === 'appointment'
                          ? `Appointment • ${time}`
                          : `${status.charAt(0).toUpperCase()+status.slice(1)} • ${time}`
                        }
                      </div>
                    </div>
                  ))}
                </div>

                {isTherapist
                  && popupDay?.day===day
                  && popupDay?.month===month
                  && popupDay?.year===year && (
                  <div className="popup-selector">
                    <select
                      value={customSlot.value}
                      onChange={e=>setCustomSlot(cs=>({...cs,value:e.target.value}))}
                    >
                      <option value="">Select Slot</option>
                      {defaultTimeSlots.map(s =>
                        <option key={s} value={s}>{s}</option>
                      )}
                    </select>
                    <select
                      value={customSlot.sessionType}
                      onChange={e=>setCustomSlot(cs=>({...cs,sessionType:e.target.value}))}
                    >
                      <option value="">Select Session Type</option>
                      {sessionTypes.map(t =>
                        <option key={t} value={t}>{t}</option>
                      )}
                    </select>
                    <input
                      type="time" value={customSlot.start}
                      onChange={e=>setCustomSlot(cs=>({...cs,start:e.target.value}))}
                    />
                    <input
                      type="time" value={customSlot.end}
                      onChange={e=>setCustomSlot(cs=>({...cs,end:e.target.value}))}
                    />
                    <button onClick={()=>handleAddSlot('available')}>
                      Add Available
                    </button>
                    <button onClick={()=>handleAddSlot('busy')}>
                      Add Busy
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isTherapist && confirmModal.show && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <p>
              Delete <strong>{confirmModal.status}</strong> slot at{' '}
              <strong>{confirmModal.time}</strong>?
            </p>
            <div className="modal-buttons">
              <button className="btn-confirm" onClick={handleDeleteSlot}>
                Yes
              </button>
              <button className="btn-cancel" onClick={()=>setConfirmModal({ show:false,id:null,time:'',status:'' })}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
