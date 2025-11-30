import React, { useState, useEffect } from 'react';
import TrackerCard from './components/TrackerCard';
import RewardsShop from './components/RewardsShop';
import GeminiCoach from './components/GeminiCoach';
import PointsChart from './components/PointsChart';
import { User, Tab } from './types';
import { generateMotivation } from './services/geminiService';
import { LayoutDashboard, Trophy, Sparkles, Heart } from 'lucide-react';

const USERS_KEY = 'sisfit_users_v2'; // Updated key to reset data for new names

const INITIAL_USERS: User[] = [
  {
    id: 'user_1',
    name: 'Ali',
    avatar: 'https://picsum.photos/seed/ali/200/200',
    color: 'pink',
    currentPoints: 0,
    lifetimePoints: 0,
    logs: {},
    processedWeeks: []
  },
  {
    id: 'user_2',
    name: 'Sissi',
    avatar: 'https://picsum.photos/seed/sissi/200/200',
    color: 'sky',
    currentPoints: 0,
    lifetimePoints: 0,
    logs: {},
    processedWeeks: []
  }
];

const POINTS = {
  water: 10,
  diet: 20,
  workout: 30
};

const PENALTY_POINTS = 50;
const MIN_WORKOUTS = 3;

// Helper to get local date string YYYY-MM-DD
const getTodayKey = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to get Week Number (ISO week date)
const getWeekKey = (date: Date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const year = d.getUTCFullYear();
  const weekNo = Math.ceil((((d.getTime() - new Date(Date.UTC(year, 0, 1)).getTime()) / 86400000) + 1) / 7);
  return `${year}-W${weekNo}`;
};

function App() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [motivation, setMotivation] = useState<string>('');
  const [hasLoaded, setHasLoaded] = useState(false);
  const [penaltyMessage, setPenaltyMessage] = useState<string | null>(null);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem(USERS_KEY);
    if (saved) {
      try {
        const parsedUsers = JSON.parse(saved);
        // Ensure new fields exist if loading from old data
        const migratedUsers = parsedUsers.map((u: any) => ({
             ...u, 
             processedWeeks: u.processedWeeks || [] 
        }));
        setUsers(migratedUsers);
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
    setHasLoaded(true);
  }, []);

  // Check for Penalties (Previous Week)
  useEffect(() => {
    if (!hasLoaded) return;

    const checkPenalties = () => {
        const today = new Date();
        // Calculate "Previous Week" Key
        const lastWeekDate = new Date(today);
        lastWeekDate.setDate(today.getDate() - 7); 
        const lastWeekKey = getWeekKey(lastWeekDate);
        
        let usersUpdated = false;
        let penaltyMsg = "";

        const newUsers = users.map(user => {
            if (user.processedWeeks.includes(lastWeekKey)) return user;

            // Analyze logs for that week
            // We iterate 7 days of that previous week to count workouts
            // Find Monday of that week
            const d = new Date(lastWeekDate);
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
            const monday = new Date(d.setDate(diff));
            
            let workoutCount = 0;
            for (let i = 0; i < 7; i++) {
                const checkDate = new Date(monday);
                checkDate.setDate(monday.getDate() + i);
                const k = checkDate.toISOString().split('T')[0]; // simple ISO date part
                if (user.logs[k]?.workout) workoutCount++;
            }

            if (workoutCount < MIN_WORKOUTS) {
                usersUpdated = true;
                penaltyMsg += `${user.name} missed the workout goal last week (${workoutCount}/${MIN_WORKOUTS}). -${PENALTY_POINTS} pts! 📉\n`;
                return {
                    ...user,
                    currentPoints: Math.max(0, user.currentPoints - PENALTY_POINTS),
                    processedWeeks: [...user.processedWeeks, lastWeekKey]
                };
            } else {
                // Mark as processed even if no penalty, so we don't check again
                return {
                    ...user,
                    processedWeeks: [...user.processedWeeks, lastWeekKey]
                };
            }
        });

        if (usersUpdated) {
            setUsers(newUsers);
            setPenaltyMessage(penaltyMsg);
            setTimeout(() => setPenaltyMessage(null), 8000);
        }
    };

    checkPenalties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasLoaded]);

  // Save to LocalStorage
  useEffect(() => {
    if (hasLoaded) {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  }, [users, hasLoaded]);

  // Fetch motivation on load
  useEffect(() => {
    const fetchMotivation = async () => {
        if(users.length >= 2) {
            const quote = await generateMotivation(
                users[0].name, users[0].lifetimePoints,
                users[1].name, users[1].lifetimePoints
            );
            setMotivation(quote);
        }
    }
    fetchMotivation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const handleToggleActivity = (userId: string, activity: 'water' | 'workout' | 'diet', date: string) => {
    const pointsValue = POINTS[activity];

    setUsers(prevUsers => prevUsers.map(user => {
      if (user.id !== userId) return user;

      const currentLogs = user.logs[date] || { water: false, workout: false, diet: false };
      const wasActive = currentLogs[activity];
      
      const pointChange = wasActive ? -pointsValue : pointsValue;
      const newCurrent = Math.max(0, user.currentPoints + pointChange);
      const newLifetime = Math.max(0, user.lifetimePoints + pointChange);

      return {
        ...user,
        currentPoints: newCurrent,
        lifetimePoints: newLifetime,
        logs: {
          ...user.logs,
          [date]: {
            ...currentLogs,
            [activity]: !wasActive
          }
        }
      };
    }));
  };

  const handleRedeem = (userId: string, rewardId: string, cost: number, type: 'solo' | 'joint') => {
    if (type === 'solo') {
        if (!confirm("Redeem this reward? Points will be deducted.")) return;
        setUsers(prevUsers => prevUsers.map(user => {
            if (user.id !== userId) return user;
            return { ...user, currentPoints: user.currentPoints - cost };
        }));
    } else {
        // Shared Reward Logic
        const totalPoints = users.reduce((sum, u) => sum + u.currentPoints, 0);
        if (totalPoints < cost) {
            alert("Not enough combined points!");
            return;
        }

        if (!confirm(`Redeem Team Reward? This costs ${cost} points combined. Points will be deducted proportionally.`)) return;

        // Deduct proportionally based on how many points they have relative to total
        setUsers(prevUsers => prevUsers.map(user => {
            const share = user.currentPoints / totalPoints;
            const deduction = Math.round(cost * share);
            return { ...user, currentPoints: Math.max(0, user.currentPoints - deduction) };
        }));
    }
  };

  const NavItem = ({ tab, icon: Icon, label }: { tab: Tab, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex flex-col items-center justify-center p-2 rounded-2xl w-20 transition-all duration-300 ${
        activeTab === tab 
          ? 'text-pink-600 bg-pink-50 transform -translate-y-2 shadow-lg' 
          : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      <Icon size={24} strokeWidth={activeTab === tab ? 2.5 : 2} />
      <span className="text-[10px] font-bold mt-1">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-xl mx-auto border-x border-gray-100 shadow-2xl overflow-hidden relative">
      
      {/* Top Decoration */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-pink-200 to-transparent -z-0 opacity-50"></div>

      {/* Header */}
      <header className="px-6 pt-10 pb-4 z-10">
        <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                SisFit <Heart className="fill-pink-500 text-pink-500 animate-pulse" size={24} />
            </h1>
            <span className="px-3 py-1 bg-white rounded-full text-xs font-bold text-gray-500 shadow-sm border border-gray-100">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
        </div>
        {motivation && !penaltyMessage && (
             <div className="bg-white/60 backdrop-blur-sm border border-white p-3 rounded-xl shadow-sm mb-4 animate-fade-in-up">
                 <p className="text-sm font-medium text-gray-600 italic">✨ "{motivation}"</p>
             </div>
        )}
        {penaltyMessage && (
             <div className="bg-red-100 border border-red-200 p-3 rounded-xl shadow-sm mb-4 animate-bounce text-red-700 text-sm font-bold whitespace-pre-line">
                 {penaltyMessage}
             </div>
        )}
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto px-6 pb-24 z-10 scrollbar-hide">
        
        {activeTab === Tab.DASHBOARD && (
            <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {users.map(user => (
                        <TrackerCard 
                            key={user.id} 
                            user={user} 
                            onToggle={handleToggleActivity}
                        />
                    ))}
                </div>
                <PointsChart users={users} />
            </div>
        )}

        {activeTab === Tab.REWARDS && (
            <div className="animate-fade-in">
                <RewardsShop users={users} onRedeem={handleRedeem} />
            </div>
        )}

        {activeTab === Tab.COACH && (
             <div className="animate-fade-in">
                <GeminiCoach />
             </div>
        )}

      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full max-w-xl bg-white border-t border-gray-100 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] px-6 py-3 flex justify-between items-end z-50 rounded-t-3xl pb-6">
        <NavItem tab={Tab.DASHBOARD} icon={LayoutDashboard} label="Tracker" />
        <NavItem tab={Tab.REWARDS} icon={Trophy} label="Rewards" />
        <NavItem tab={Tab.COACH} icon={Sparkles} label="Coach" />
      </nav>

    </div>
  );
}

export default App;