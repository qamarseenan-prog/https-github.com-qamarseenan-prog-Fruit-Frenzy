import React, { useEffect, useState } from 'react';
import { ScoreData } from '../types';
import { generateGameCommentary } from '../services/geminiService';

interface GameOverModalProps {
  scoreData: ScoreData;
  onRestart: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ scoreData, onRestart }) => {
  const [commentary, setCommentary] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    const fetchCommentary = async () => {
      setLoading(true);
      const result = await generateGameCommentary(scoreData.score, scoreData.caught, scoreData.missed);
      if (mounted) {
        setCommentary(result);
        setLoading(false);
      }
    };

    fetchCommentary();

    return () => {
      mounted = false;
    };
  }, [scoreData]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center transform transition-all scale-100 animate-fade-in-up text-slate-800">
        <h2 className="text-4xl font-bold mb-2 text-red-500">Game Over!</h2>
        <div className="text-6xl font-black text-slate-800 mb-6">{scoreData.score}</div>

        <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-100 p-3 rounded-xl">
                <p className="text-sm text-green-700 font-bold uppercase">Caught</p>
                <p className="text-2xl font-bold">{scoreData.caught}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-xl">
                <p className="text-sm text-red-700 font-bold uppercase">Missed</p>
                <p className="text-2xl font-bold">{scoreData.missed}</p>
            </div>
        </div>

        <div className="mb-8 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-indigo-100">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">AI Performance Review</h3>
            {loading ? (
                <div className="flex justify-center items-center space-x-2 h-12">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            ) : (
                <p className="text-indigo-900 font-medium text-sm leading-relaxed italic">
                    "{commentary}"
                </p>
            )}
        </div>

        <button
          onClick={onRestart}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-xl text-xl shadow-lg transform hover:scale-[1.02] transition-all"
        >
          Play Again 🍎
        </button>
      </div>
    </div>
  );
};

export default GameOverModal;