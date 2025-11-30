import React, { useState } from 'react';
import { User, DailyActivity } from '../types';
import { Droplets, Dumbbell, Salad, CheckCircle2, Circle, AlertCircle, CalendarDays } from 'lucide-react';

interface TrackerCardProps {
  user: User;
  onToggle: (userId: string, activity: 'water' | 'workout' | 'diet', date: string) => void;
}

const TrackerCard: React.FC<TrackerCardProps> = ({ user, onToggle }) => {
  // Get today's date string YYYY-MM-DD (Local)
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const today = `${year}-${month}-${day}`;

  const [selectedDate, setSelectedDate] = useState(today);
  const isViewingToday = selectedDate === today;

  const logs = user.logs[selectedDate] || { water: false, workout: false, diet: false };

  // Helper for Weekly stats (Always calculates current week regardless of view)
  const getWeeklyWorkoutCount = () => {
    const todayDate = new Date();
    const currentDay = todayDate.getDay(); // 0 is Sunday
    // Calculate Monday of current week
    const diff = todayDate.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const monday = new Date(todayDate.setDate(diff));
    
    let count = 0;
    for(let i=0; i<7; i++) {
        const temp = new Date(monday);
        temp.setDate(monday.getDate() + i);
        // Don't count future days
        if (temp > new Date()) break;
        
        const key = temp.toISOString().split('T')[0];
        if (user.logs[key]?.workout) count++;
    }
    return count;
  };

  const weeklyWorkouts = getWeeklyWorkoutCount();
  const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
  const atRisk = isWeekend && weeklyWorkouts < 3;

  const themeColor = user.color === 'pink' ? 'pink' : 'sky';
  
  // Dynamic classes based on theme
  const bgClass = user.color === 'pink' ? 'bg-pink-50 border-pink-200' : 'bg-sky-50 border-sky-200';
  const textClass = user.color === 'pink' ? 'text-pink-600' : 'text-sky-600';
  
  const getButtonClass = (active: boolean) => {
    if (active) {
      return user.color === 'pink' 
        ? 'bg-pink-500 border-pink-500 text-white shadow-md transform scale-[1.02]' 
        : 'bg-sky-500 border-sky-500 text-white shadow-md transform scale-[1.02]';
    }
    return `bg-white border-transparent hover:border-${themeColor}-300 text-gray-600 shadow-sm`;
  };

  // Generate last 7 days for history view
  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  // Display date formatter
  const formatDateDisplay = (dateStr: string) => {
      if (dateStr === today) return "Today";
      const [y, m, d] = dateStr.split('-');
      const dateObj = new Date(parseInt(y), parseInt(m)-1, parseInt(d));
      return dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className={`rounded-3xl p-6 border-2 ${bgClass} shadow-xl flex flex-col relative overflow-hidden transition-all`}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-4 z-10">
        <div className={`w-16 h-16 rounded-full border-4 border-white shadow-lg overflow-hidden flex-shrink-0 bg-white`}>
          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <h2 className={`text-2xl font-bold ${textClass}`}>{user.name}</h2>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Daily Bank</p>
          <div className="flex items-baseline gap-1">
             <span className={`text-3xl font-black ${textClass}`}>{user.currentPoints}</span>
             <span className="text-sm text-gray-400 font-bold">pts</span>
          </div>
        </div>
      </div>

      {/* Weekly Goal Status (Always shows current week status) */}
      <div className={`mb-4 rounded-xl p-2 flex items-center justify-between text-xs font-bold ${
          atRisk ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-white/60 text-gray-500'
      }`}>
          <div className="flex items-center gap-2">
            {atRisk ? <AlertCircle size={16} /> : <Dumbbell size={16} />}
            <span>Weekly Workouts</span>
          </div>
          <span className={weeklyWorkouts >= 3 ? 'text-green-600' : ''}>
              {weeklyWorkouts}/3 {weeklyWorkouts >= 3 && '✅'}
          </span>
      </div>

      {/* History Editing Indicator */}
      {!isViewingToday && (
          <div className="flex items-center justify-between bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg mb-3 border border-yellow-200 animate-fade-in">
              <div className="flex items-center gap-2 text-xs font-bold">
                  <CalendarDays size={14} />
                  <span>Editing: {formatDateDisplay(selectedDate)}</span>
              </div>
              <button 
                  onClick={() => setSelectedDate(today)}
                  className="text-[10px] bg-white px-2 py-1 rounded shadow-sm hover:bg-yellow-50 font-bold uppercase"
              >
                  Back to Today
              </button>
          </div>
      )}

      {/* Checklist */}
      <div className="flex-1 space-y-3 z-10 mb-4">
        
        <button 
          onClick={() => onToggle(user.id, 'water', selectedDate)}
          className={getButtonClass(logs.water) + " flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-200 w-full"}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${logs.water ? 'bg-white/20' : 'bg-blue-100 text-blue-500'}`}>
              <Droplets size={20} />
            </div>
            <div className="text-left">
              <span className="block font-bold">2L Water</span>
              <span className="text-[10px] opacity-80 uppercase tracking-wider">+10 pts</span>
            </div>
          </div>
          {logs.water ? <CheckCircle2 size={24} /> : <Circle size={24} className="opacity-30" />}
        </button>

        <button 
          onClick={() => onToggle(user.id, 'diet', selectedDate)}
          className={getButtonClass(logs.diet) + " flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-200 w-full"}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${logs.diet ? 'bg-white/20' : 'bg-green-100 text-green-500'}`}>
              <Salad size={20} />
            </div>
             <div className="text-left">
              <span className="block font-bold">Healthy Diet</span>
              <span className="text-[10px] opacity-80 uppercase tracking-wider">+20 pts</span>
            </div>
          </div>
          {logs.diet ? <CheckCircle2 size={24} /> : <Circle size={24} className="opacity-30" />}
        </button>

        <button 
          onClick={() => onToggle(user.id, 'workout', selectedDate)}
          className={getButtonClass(logs.workout) + " flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-200 w-full"}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${logs.workout ? 'bg-white/20' : 'bg-orange-100 text-orange-500'}`}>
              <Dumbbell size={20} />
            </div>
             <div className="text-left">
              <span className="block font-bold">Workout</span>
              <span className="text-[10px] opacity-80 uppercase tracking-wider">+30 pts</span>
            </div>
          </div>
          {logs.workout ? <CheckCircle2 size={24} /> : <Circle size={24} className="opacity-30" />}
        </button>

      </div>

      {/* History Visualization & Selector */}
      <div className="relative z-10 mt-auto pt-4 border-t border-black/5">
         <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">History (Click to Edit)</p>
         </div>
         <div className="flex justify-between items-end gap-1 h-12">
            {last7Days.map(date => {
                 const year = date.getFullYear();
                 const month = String(date.getMonth() + 1).padStart(2, '0');
                 const d = String(date.getDate()).padStart(2, '0');
                 const dateKey = `${year}-${month}-${d}`;
                 
                 const dayLog = user.logs[dateKey] || { water: false, workout: false, diet: false };
                 const points = (dayLog.water ? 10 : 0) + (dayLog.workout ? 30 : 0) + (dayLog.diet ? 20 : 0);
                 const percentage = (points / 60) * 100;
                 const height = Math.max(10, percentage); 
                 const isSelected = dateKey === selectedDate;
                 const isTodayItem = dateKey === today;
                 
                 return (
                     <button 
                        key={dateKey} 
                        onClick={() => setSelectedDate(dateKey)}
                        className="flex flex-col items-center flex-1 group relative cursor-pointer focus:outline-none"
                     >
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-20">
                            {date.toLocaleDateString(undefined, {month:'short', day:'numeric'})}: {points}pts
                        </div>

                        {/* Selection Indicator */}
                        {isSelected && (
                            <div className={`absolute -bottom-1 w-1 h-1 rounded-full ${user.color === 'pink' ? 'bg-pink-500' : 'bg-sky-500'}`}></div>
                        )}

                        <div 
                            style={{ height: `${height}%` }} 
                            className={`w-full max-w-[8px] md:max-w-[12px] rounded-t-full transition-all duration-300 ${
                                points > 0 
                                    ? (user.color === 'pink' ? 'bg-pink-400' : 'bg-sky-400') 
                                    : 'bg-black/5'
                            } ${isSelected ? 'ring-2 ring-offset-1 ring-gray-400 opacity-100' : 'opacity-60 hover:opacity-100'}
                              ${isTodayItem && !isSelected ? 'ring-1 ring-offset-0 ring-gray-200' : ''}
                            `}
                        ></div>
                        <span className={`text-[9px] mt-1 font-bold uppercase transition-colors ${isSelected ? 'text-gray-900 scale-110' : 'text-gray-300'}`}>
                            {date.toLocaleDateString('en-US', {weekday: 'narrow'})}
                        </span>
                     </button>
                 )
            })}
         </div>
      </div>
      
      {/* Decorative Background Blob */}
      <div className={`absolute -bottom-10 -right-10 w-40 h-40 rounded-full mix-blend-multiply filter blur-2xl opacity-30 ${user.color === 'pink' ? 'bg-pink-300' : 'bg-sky-300'}`}></div>
    </div>
  );
};

export default TrackerCard;