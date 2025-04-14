import React, { useEffect, useMemo, useRef, useState } from 'react';
import '../css/Calendar.css';
import { db } from '../firebase/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../services/authContext';

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const Calendar = ({ isTherapist }) => {
    const { currentUser, userRole } = useAuth();
    const today = new Date();
    const dayRefs = useRef([]);
    const [year, setYear] = useState(today.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
    const [availableDates, setAvailableDates] = useState([]);
    const [busyDates, setBusyDates] = useState([]);
    const [popupDay, setPopupDay] = useState(null);

    useEffect(() => {
        scrollToToday();
        fetchAvailability();

        const handleClickOutside = (e) => {
            if (!e.target.closest('.calendar-day')) {
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
            const data = snap.data();
            setAvailableDates(data.available || []);
            setBusyDates(data.busy || []);
        }
    };

    const updateAvailability = async (dateStr, status) => {
        let updatedAvailable = [...availableDates];
        let updatedBusy = [...busyDates];

        updatedAvailable = updatedAvailable.filter((d) => d !== dateStr);
        updatedBusy = updatedBusy.filter((d) => d !== dateStr);

        if (status === 'available') updatedAvailable.push(dateStr);
        if (status === 'busy') updatedBusy.push(dateStr);

        setAvailableDates(updatedAvailable);
        setBusyDates(updatedBusy);

        await setDoc(doc(db, 'availability', currentUser.uid), {
            available: updatedAvailable,
            busy: updatedBusy,
        });
    };

    const handleDayClick = (day, month, year, e) => {
        e.stopPropagation(); // popup dışı tıklamada kapanmasın
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

    const handleStatusSelect = (status) => {
        if (!popupDay) return;
        const { day, month, year } = popupDay;
        const dateStr = `${year}-${month + 1}-${day}`;
        updateAvailability(dateStr, status);
        setPopupDay(null);
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
                    const isAvailable = availableDates?.includes(dateStr);
                    const isBusy = busyDates?.includes(dateStr);
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

                            {isAvailable && <span className="tag available">Available</span>}
                            {isBusy && <span className="tag busy">Busy</span>}

                            {popupDay &&
                                popupDay.day === day &&
                                popupDay.month === month &&
                                popupDay.year === year && (
                                    <div className="popup-selector">
                                        <button onClick={() => handleStatusSelect('available')}>Available</button>
                                        <button onClick={() => handleStatusSelect('busy')}>Busy</button>
                                    </div>
                                )}
                        </div>
                    );
                })}
            </div>
        ));
    }, [year, availableDates, busyDates, popupDay]);

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
