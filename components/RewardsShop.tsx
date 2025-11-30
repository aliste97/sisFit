import React from 'react';
import { Reward, User } from '../types';
import { Gift, Lock, Plane, Users } from 'lucide-react';

interface RewardsShopProps {
  users: User[];
  onRedeem: (userId: string, rewardId: string, cost: number, type: 'solo' | 'joint') => void;
}

const REWARDS: Reward[] = [
  { id: '1', title: 'Cheat Meal', cost: 300, emoji: '🍔', description: 'One guilt-free meal of choice', type: 'solo' },
  { id: '2', title: 'Movie Night', cost: 500, emoji: '🍿', description: 'Sister movie night, winner picks', type: 'solo' },
  { id: '3', title: 'New Water Bottle', cost: 1000, emoji: '🧴', description: 'Treat yourself to gear', type: 'solo' },
  { id: '4', title: 'Spa Day / Mani-Pedi', cost: 2000, emoji: '💅', description: 'Relaxation time!', type: 'solo' },
  { id: '5', title: 'New Gym Set', cost: 3000, emoji: '👙', description: 'Look good, feel good', type: 'solo' },
  { id: '6', title: 'Weekend Trip', cost: 10000, emoji: '✈️', description: 'The ultimate sister getaway', type: 'joint' },
  { id: '7', title: 'Concert Tickets', cost: 5000, emoji: '🎟️', description: 'Go see your fav artist', type: 'joint' },
];

const RewardsShop: React.FC<RewardsShopProps> = ({ users, onRedeem }) => {
  const soloRewards = REWARDS.filter(r => r.type === 'solo');
  const jointRewards = REWARDS.filter(r => r.type === 'joint');

  const combinedPoints = users.reduce((sum, u) => sum + u.currentPoints, 0);

  return (
    <div className="space-y-8 pb-20">
      <div className="text-center">
        <h2 className="text-3xl font-black text-purple-900 mb-2">Rewards Shop</h2>
        <p className="text-purple-600">Treat yo' self or save together!</p>
      </div>

      {/* Shared Goals Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden">
         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
                <Users className="text-purple-200" />
                <h3 className="text-xl font-bold">Team Goals</h3>
            </div>
            
            <div className="flex items-end gap-2 mb-6">
                 <span className="text-4xl font-black">{combinedPoints}</span>
                 <span className="mb-2 text-purple-200 font-bold text-sm">Combined Points</span>
            </div>

            <div className="space-y-3">
                {jointRewards.map(reward => {
                    const progress = Math.min(100, (combinedPoints / reward.cost) * 100);
                    const canAfford = combinedPoints >= reward.cost;
                    
                    return (
                        <div key={reward.id} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{reward.emoji}</span>
                                    <div>
                                        <p className="font-bold text-sm">{reward.title}</p>
                                        <p className="text-xs text-purple-200">{reward.cost} pts total</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => canAfford && onRedeem(users[0].id, reward.id, reward.cost, 'joint')}
                                    disabled={!canAfford}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                        canAfford 
                                        ? 'bg-white text-purple-600 shadow-lg hover:scale-105' 
                                        : 'bg-white/20 text-white/50 cursor-not-allowed'
                                    }`}
                                >
                                    {canAfford ? 'Redeem Team Reward' : `${Math.round(progress)}%`}
                                </button>
                            </div>
                            {/* Progress Bar */}
                            <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
                                <div 
                                    className="bg-yellow-400 h-full transition-all duration-1000" 
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    )
                })}
            </div>
         </div>
      </div>

      {/* Individual Shops */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {users.map(user => (
          <div key={user.id} className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
             <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                <img src={user.avatar} className="w-10 h-10 rounded-full" alt={user.name} />
                <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{user.name}'s Shop</h3>
                    <p className="text-xs text-gray-500">Balance: <span className="font-bold text-green-600">{user.currentPoints} pts</span></p>
                </div>
             </div>

             <div className="space-y-4">
                {soloRewards.map(reward => {
                    const canAfford = user.currentPoints >= reward.cost;
                    return (
                        <div key={reward.id} className={`flex items-center justify-between p-3 rounded-2xl border ${canAfford ? 'border-gray-200 bg-gray-50' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{reward.emoji}</span>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-sm">{reward.title}</h4>
                                    <p className="text-xs text-gray-500 font-bold text-orange-500">{reward.cost} pts</p>
                                </div>
                            </div>
                            <button
                                onClick={() => canAfford && onRedeem(user.id, reward.id, reward.cost, 'solo')}
                                disabled={!canAfford}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    canAfford 
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md hover:shadow-lg active:scale-95' 
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                {canAfford ? 'Redeem' : <Lock size={12} />}
                            </button>
                        </div>
                    )
                })}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RewardsShop;