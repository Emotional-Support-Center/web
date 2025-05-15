import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import '../css/Calendar.css';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const PublicCalendar = ({ therapistId }) => {
  const today = new Date();
  const [year] = useState(today.getFullYear());
  const [availability, setAvailability] = useState({});

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!therapistId) return;

      const q = query(
        collection(db, 'availability'),
        where('therapistId', '==', therapistId)
      );
      const snapshot = await getDocs(q);

      const slotMap = {};
      snapshot.forEach((doc) => {
        const { date, time, status } = doc.data();
        if (!slotMap[date]) slotMap[date] = [];
        slotMap[date].push({ time, status });
      });

      Object.keys(slotMap).forEach(date => {
        slotMap[date].sort((a, b) => a.time.localeCompare(b.time));
      });

      setAvailability(slotMap);
    };

    fetchAvailability();
  }, [therapistId]);

  const generateCalendar = () => {
    const allDays = [];
    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        allDays.push({ month, day });
      }
    }

    const weeks = [];
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7));
    }

    return weeks.map((week, wIndex) => (
      <div className="calendar-week" key={`week-${wIndex}`}>
        {week.map(({ month, day }, dIndex) => {
          const dateStr = `${year}-${month + 1}-${day}`;
          const slots = availability[dateStr] || [];
          const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
          const showMonthLabel = day === 1;

          return (
            <div
              key={`${month}-${day}`}
              data-month={month}
              data-day={day}
              className={`calendar-day`}
            >
              <span className={`calendar-day-number ${isToday ? 'today' : ''}`}>{day}</span>

              {showMonthLabel && (
                <span className="new-month-label">{monthNames[month]}</span>
              )}

              <div className="slot-indicators">
                {slots.map(({ time, status }, i) => (
                  <div
                    key={i}
                    className={`slot-dot ${status}`}
                  >
                    <div className="slot-tooltip">{`${status.toUpperCase()}: ${time}`}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    ));
  };

  return (
    <div className="calendar-body">
      <div className="calendar-days-of-week">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
          <div key={i}>{day}</div>
        ))}
      </div>
      {generateCalendar()}
    </div>
  );
};

export default PublicCalendar;
