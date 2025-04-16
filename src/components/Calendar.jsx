import React, { useEffect, useMemo, useRef, useState } from 'react';
import '../css/Calendar.css';
import { db } from '../firebase/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../services/authContext';

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const hours = [
    "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30",
    "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00"
];

const Calendar = ({ isTherapist }) => {
    const { currentUser, userRole } = useAuth();
    const today = new Date();
    const dayRefs = useRef([]);
    const [year, setYear] = useState(today.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
    const [availability, setAvailability] = useState({});
    const [popupDay, setPopupDay] = useState(null);

    useEffect(() => {
        scrollToToday();
        fetchAvailability();

        const handleClickOutside = (e) => {
            if (!e.target.closest('.calendar-day') && !e.target.closest('.popup-selector')) {
                setPopupDay(null);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const scrollToToday = () => {
        const index = dayRefs.current.findIndex(
            (ref) =>
                ref &&
                parseInt(ref.getAttribute('data-month')) === today.getMonth() &&
                parseInt(ref.getAttribute('data-day')) === today.getDate()
        );
        if (index !== -1 && dayRefs.current[index]) {
            dayRefs.current[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const fetchAvailability = async () => {
        if (!currentUser) return;
        const ref = doc(db, 'availability', currentUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
            setAvailability(snap.data());
        }
    };

    const updateTimeSlotStatus = async (dateStr, hour, status) => {
        const ref = doc(db, 'availability', currentUser.uid);
        const snap = await getDoc(ref);
        const data = snap.exists() ? snap.data() : {};

        const dayData = data[dateStr] || { available: [], busy: [] };

        dayData.available = dayData.available.filter(h => h !== hour);
        dayData.busy = dayData.busy.filter(h => h !== hour);

        if (!dayData[status].includes(hour)) {
            dayData[status].push(hour);
            dayData[status].sort(); // optional: keep time order
        }

        await setDoc(ref, { [dateStr]: dayData }, { merge: true }); // ✅ only update that date
        setAvailability(prev => ({ ...prev, [dateStr]: dayData }));
        setPopupDay(null);
    };


    const handleDayClick = (day, month, year, e) => {
        e.stopPropagation();
        const clickedDate = new Date(year, month, day);
        const isToday =
            today.getDate() === day &&
            today.getMonth() === month &&
            today.getFullYear() === year;

        if (clickedDate < today && !isToday) return;

        if (isTherapist && userRole === 'therapist') {
            setPopupDay({ day, month, year });
        }
    };

    const generateCalendar = useMemo(() => {
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
                    const index = wIndex * 7 + dIndex;
                    const refDate = new Date(year, month, day);
                    const isToday =
                        today.getDate() === day &&
                        today.getMonth() === month &&
                        today.getFullYear() === year;
                    const isPast = refDate < today && !isToday;
                    const dateStr = `${year}-${month + 1}-${day}`;
                    const dayData = availability[dateStr] || {};
                    const showMonthLabel = day === 1;

                    return (
                        <div
                            key={`${month}-${day}`}
                            ref={(el) => (dayRefs.current[index] = el)}
                            data-month={month}
                            data-day={day}
                            onClick={(e) => handleDayClick(day, month, year, e)}
                            className={`calendar-day ${isPast ? 'past' : ''}`}
                        >
                            <span className={`calendar-day-number ${isToday ? 'today' : ''}`}>
                                {day}
                            </span>

                            {showMonthLabel && (
                                <span className="new-month-label">{monthNames[month]}</span>
                            )}

                            {dayData?.available?.length > 0 && <span className="tag available">Available</span>}
                            {dayData?.busy?.length > 0 && <span className="tag busy">Busy</span>}

                            {popupDay &&
                                popupDay.day === day &&
                                popupDay.month === month &&
                                popupDay.year === year && (
                                    <div className="popup-selector">
                                        <p className="popup-header">Select time slots:</p>
                                        {hours.map((hour) => (
                                            <div key={hour} className="hour-slot">
                                                <span>{hour}</span>
                                                <button onClick={() => updateTimeSlotStatus(dateStr, hour, 'available')}>Available</button>
                                                <button onClick={() => updateTimeSlotStatus(dateStr, hour, 'busy')}>Busy</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                        </div>
                    );
                })}
            </div>
        ));
    }, [year, availability, popupDay]);

    return (
        <div className="calendar-body">
            <div className="calendar-days-of-week">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                    <div key={i}>{day}</div>
                ))}
            </div>
            {generateCalendar}
        </div>
    );
};

export default Calendar;
