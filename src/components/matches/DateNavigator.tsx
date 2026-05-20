import React, { useState, useRef, useEffect } from 'react';

interface DateNavigatorProps {
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}

const DateNavigator: React.FC<DateNavigatorProps> = ({ selectedDate, onSelectDate }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Use the selected date or today's date if null
  const baseDate = selectedDate ? new Date(selectedDate) : new Date();
  const [viewDate, setViewDate] = useState<Date>(baseDate);

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  useEffect(() => {
    if (selectedDate) {
      setViewDate(new Date(selectedDate));
    } else {
      setViewDate(new Date());
    }
  }, [selectedDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };
    if (showCalendar) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCalendar]);

  const handlePrevDay = () => {
    const prev = new Date(baseDate);
    prev.setDate(prev.getDate() - 1);
    onSelectDate(prev.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const next = new Date(baseDate);
    next.setDate(next.getDate() + 1);
    onSelectDate(next.toISOString().split('T')[0]);
  };

  const handlePrevMonth = () => {
    const prev = new Date(viewDate);
    prev.setMonth(prev.getMonth() - 1);
    setViewDate(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(viewDate);
    next.setMonth(next.getMonth() + 1);
    setViewDate(next);
  };

  // Calendar logic
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  // Adjust so Monday is 0, Sunday is 6
  const emptySlots = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Format header label
  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const displayLabel = isToday || !selectedDate 
    ? "Aujourd'hui" 
    : new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <div className="relative flex items-center justify-between mb-4 bg-white dark:bg-brand-navy-3 rounded-full border border-slate-100 dark:border-brand-slate px-2 py-1.5 shadow-sm">
      
      <button onClick={handlePrevDay} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-brand-navy-2 text-slate-500 dark:text-brand-text-2 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button 
        onClick={() => setShowCalendar(!showCalendar)}
        className="flex items-center gap-1.5 px-4 py-1 rounded-full hover:bg-slate-50 dark:hover:bg-brand-navy-2 transition-colors text-sm font-bold text-slate-800 dark:text-slate-100"
      >
        <span className="capitalize">{displayLabel}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${showCalendar ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <button onClick={handleNextDay} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-brand-navy-2 text-slate-500 dark:text-brand-text-2 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Calendar Popover */}
      {showCalendar && (
        <div 
          ref={calendarRef} 
          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-80 bg-white dark:bg-brand-navy-3 border border-slate-200 dark:border-brand-slate rounded-2xl shadow-xl z-50 p-4 animate-fade-in"
        >
          {/* Calendar Header */}
          <div className="flex justify-between items-center mb-4">
            <button onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-brand-navy-2 text-slate-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
            <span className="font-bold text-slate-800 dark:text-white text-sm capitalize">
              {viewDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-brand-navy-2 text-slate-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {weekDays.map(day => (
               <div key={day} className="text-[10px] font-semibold text-slate-400 dark:text-brand-text-3 py-1">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: emptySlots }).map((_, i) => (
              <div key={`empty-${i}`} className="py-1.5 text-sm"></div>
            ))}
            {calendarDays.map(day => {
              const currentDateString = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
              const isSelected = selectedDate === currentDateString;
              const isTodayDay = new Date().toISOString().split('T')[0] === currentDateString;
              
              let buttonClasses = 'text-slate-700 dark:text-slate-200';
              if (isSelected) {
                buttonClasses = 'bg-brand-green text-white shadow-md font-bold';
              } else if (isTodayDay) {
                buttonClasses = 'bg-slate-100 dark:bg-brand-navy-1 text-brand-green border border-slate-200 dark:border-brand-slate font-bold';
              }

              return (
                <button 
                  key={day}
                  onClick={() => {
                    onSelectDate(currentDateString);
                    setShowCalendar(false);
                  }}
                  className={`py-1.5 text-sm rounded-full hover:bg-slate-100 dark:hover:bg-brand-navy-2 transition-colors ${buttonClasses}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

export default DateNavigator;
