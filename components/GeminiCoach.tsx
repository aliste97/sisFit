import React, { useState, useEffect } from 'react';
import { generateChallenge, askCoach } from '../services/geminiService';
import { Sparkles, MessageCircle, BrainCircuit } from 'lucide-react';

const GeminiCoach: React.FC = () => {
  const [dailyChallenge, setDailyChallenge] = useState<{title: string, description: string} | null>(null);
  const [loadingChallenge, setLoadingChallenge] = useState(false);
  
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loadingAnswer, setLoadingAnswer] = useState(false);

  const handleGetChallenge = async () => {
    setLoadingChallenge(true);
    const challenge = await generateChallenge();
    setDailyChallenge(challenge);
    setLoadingChallenge(false);
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoadingAnswer(true);
    const response = await askCoach(question);
    setAnswer(response);
    setLoadingAnswer(false);
    setQuestion('');
  };

  return (
    <div className="space-y-6 pb-20">
       <div className="text-center">
        <h2 className="text-3xl font-black text-indigo-900 mb-2">AI Coach</h2>
        <p className="text-indigo-600">Get inspired and clear your doubts!</p>
      </div>

      {/* Challenge Generator */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-20">
            <BrainCircuit size={120} />
        </div>
        
        <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2">Daily Surprise Challenge</h3>
            <p className="text-indigo-100 mb-6 text-sm">Shake things up with an AI-generated mini-challenge!</p>
            
            {!dailyChallenge ? (
                <button 
                    onClick={handleGetChallenge}
                    disabled={loadingChallenge}
                    className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-50 transition-colors flex items-center gap-2"
                >
                    {loadingChallenge ? <span className="animate-spin">✨</span> : <Sparkles size={18} />}
                    {loadingChallenge ? 'Generating...' : 'Reveal Today\'s Challenge'}
                </button>
            ) : (
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 animate-fade-in">
                    <h4 className="text-xl font-bold text-yellow-300 mb-1">{dailyChallenge.title}</h4>
                    <p className="text-white font-medium">{dailyChallenge.description}</p>
                    <button 
                        onClick={handleGetChallenge}
                        className="mt-4 text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors"
                    >
                        Get another one
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* Q&A Section */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MessageCircle size={20} className="text-indigo-500" />
            Ask the Coach
        </h3>
        
        <div className="h-48 overflow-y-auto mb-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
             {!answer ? (
                 <p className="text-gray-400 text-center text-sm italic mt-16">Ask for a healthy snack idea or a workout tip...</p>
             ) : (
                 <div className="flex gap-3">
                     <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <Sparkles size={14} className="text-indigo-600" />
                     </div>
                     <p className="text-gray-700 text-sm leading-relaxed">{answer}</p>
                 </div>
             )}
        </div>

        <form onSubmit={handleAsk} className="relative">
            <input 
                type="text" 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., Is oatmeal good for breakfast?"
                className="w-full bg-gray-100 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all text-sm"
            />
            <button 
                type="submit"
                disabled={loadingAnswer || !question.trim()}
                className="absolute right-2 top-2 p-1.5 bg-indigo-600 rounded-lg text-white disabled:opacity-50 hover:bg-indigo-700 transition-colors"
            >
                {loadingAnswer ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Sparkles size={16} />}
            </button>
        </form>
      </div>
    </div>
  );
};

export default GeminiCoach;
