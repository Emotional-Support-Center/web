import React, { useEffect, useMemo, useRef, useState } from 'react';
import '../css/Calendar.css';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const ContinuousCalendar = ({ onClick }) => {
    const today = new Date();
    const dayRefs = useRef([]);
    const [year, setYear] = useState(today.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth());

    const scrollToDay = (monthIndex, dayIndex) => {
        const targetDayIndex = dayRefs.current.findIndex(
            (ref) =>
                ref &&
                ref.getAttribute('data-month') === `${monthIndex}` &&
                ref.getAttribute('data-day') === `${dayIndex}`
        );
        const targetElement = dayRefs.current[targetDayIndex];
        if (targetDayIndex !== -1 && targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const handlePrevYear = () => setYear((prev) => prev - 1);
    const handleNextYear = () => setYear((prev) => prev + 1);
    const handleMonthChange = (e) => {
        const monthIndex = parseInt(e.target.value, 10);
        setSelectedMonth(monthIndex);
        scrollToDay(monthIndex, 1);
    };
    const handleTodayClick = () => {
        setYear(today.getFullYear());
        scrollToDay(today.getMonth(), today.getDate());
    };

    const handleDayClick = (day, month, year) => {
        if (!onClick) return;
        const validMonth = month < 0 ? 11 : month;
        const validYear = month < 0 ? year - 1 : year;
        onClick(day, validMonth, validYear);
    };

    const generateCalendar = useMemo(() => {
        const generateDays = () => {
            const days = [];
            const startDay = new Date(year, 0, 1).getDay();
            if (startDay < 6) {
                for (let i = 0; i < startDay; i++) {
                    days.push({ month: -1, day: 32 - startDay + i });
                }
            }

            for (let month = 0; month < 12; month++) {
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                for (let day = 1; day <= daysInMonth; day++) {
                    days.push({ month, day });
                }
            }

            const remainder = days.length % 7;
            if (remainder > 0) {
                const fill = 7 - remainder;
                for (let i = 1; i <= fill; i++) {
                    days.push({ month: 0, day: i }); // Next year filler
                }
            }
            return days;
        };

        const allDays = generateDays();
        const weeks = [];
        for (let i = 0; i < allDays.length; i += 7) {
            weeks.push(allDays.slice(i, i + 7));
        }

        return weeks.map((week, wIndex) => (
            <div className="calendar-week" key={`week-${wIndex}`}>
                {week.map(({ month, day }, dIndex) => {
                    const index = wIndex * 7 + dIndex;
                    const isNewMonth = index === 0 || allDays[index - 1].month !== month;
                    const isToday =
                        today.getDate() === day &&
                        today.getMonth() === month &&
                        today.getFullYear() === year;

                    return (
                        <div
                            key={`${month}-${day}`}
                            ref={(el) => (dayRefs.current[index] = el)}
                            data-month={month}
                            data-day={day}
                            onClick={() => handleDayClick(day, month, year)}
                            className={`calendar-day ${month < 0 ? 'faded' : ''}`}
                        >
              <span className={`calendar-day-number ${isToday ? 'today' : ''}`}>
                {day}
              </span>
                            {isNewMonth && month >= 0 && (
                                <span className="new-month-label">{monthNames[month]}</span>
                            )}
                        </div>
                    );
                })}
            </div>
        ));
    }, [year]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const month = parseInt(entry.target.getAttribute('data-month'), 10);
                        if (!isNaN(month)) setSelectedMonth(month);
                    }
                });
            },
            {
                root: document.querySelector('.calendar-container'),
                rootMargin: '-75% 0px -25% 0px',
                threshold: 0,
            }
        );

        dayRefs.current.forEach((ref) => {
            if (ref && ref.getAttribute('data-day') === '15') {
                observer.observe(ref);
            }
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <div className="calendar-controls">
                    <select value={selectedMonth} onChange={handleMonthChange}>
                        {monthNames.map((m, i) => (
                            <option key={i} value={i}>
                                {m}
                            </option>
                        ))}
                    </select>
                    <button onClick={handleTodayClick}>Today</button>
                </div>
                <div className="calendar-year">
                    <button onClick={handlePrevYear}>◀</button>
                    <span>{year}</span>
                    <button onClick={handleNextYear}>▶</button>
                </div>

            </div>
            <div className="calendar-body">
                <div className="calendar-days-of-week">
                    {daysOfWeek.map((day, i) => (
                        <div key={i}>{day}</div>
                    ))}
                </div>
                {generateCalendar}
            </div>

        </div>
    );
};

export default ContinuousCalendar;
