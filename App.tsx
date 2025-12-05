import React, { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import GameOverModal from './components/GameOverModal';
import { GameStatus, ScoreData } from './types';
import { HEART_EMOJI, INITIAL_LIVES } from './constants';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [finalScoreData, setFinalScoreData] = useState<ScoreData | null>(null);

  const handleStartGame = () => {
    setScore(0);
    setLives(INITIAL_LIVES);
    setStatus(GameStatus.PLAYING);
  };

  const handleGameOver = (data: ScoreData) => {
    setFinalScoreData(data);
    setStatus(GameStatus.GAME_OVER);
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-sky-300 to-sky-100 overflow-hidden flex flex-col">
      {/* Header UI */}
      <div className="absolute top-0 left-0 w-full p-4 z-10 flex justify-between items-start pointer-events-none">
        <div className="bg-white/30 backdrop-blur-md rounded-2xl p-3 shadow-sm border border-white/40">
           <p className="text-sky-900 text-xs font-bold uppercase tracking-wider">Score</p>
           <p className="text-sky-900 text-3xl font-black">{score}</p>
        </div>
        
        <div className="flex space-x-1">
           {Array.from({ length: Math.max(0, lives) }).map((_, i) => (
             <span key={i} className="text-3xl filter drop-shadow-sm animate-pulse">{HEART_EMOJI}</span>
           ))}
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-grow relative z-0">
        <GameCanvas 
          status={status} 
          onScoreUpdate={setScore} 
          onLivesUpdate={setLives}
          onGameOver={handleGameOver}
        />
      </div>

      {/* Start Screen Overlay */}
      {status === GameStatus.IDLE && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-md mx-4 transform hover:scale-105 transition-transform duration-300">
            <h1 className="text-6xl mb-4">🧺</h1>
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500 mb-2">
              Fruit Frenzy
            </h1>
            <p className="text-slate-500 mb-8 font-medium">Catch the falling fruit! Don't let them hit the ground.</p>
            <button 
              onClick={handleStartGame}
              className="px-10 py-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold rounded-full text-2xl shadow-lg shadow-green-400/30 hover:shadow-green-400/50 hover:-translate-y-1 transition-all"
            >
              Start Game
            </button>
            <p className="mt-6 text-xs text-slate-400 uppercase tracking-widest">
                Use Arrow Keys or Drag to Move
            </p>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {status === GameStatus.GAME_OVER && finalScoreData && (
        <GameOverModal 
          scoreData={finalScoreData} 
          onRestart={handleStartGame} 
        />
      )}
      
      {/* Footer / Instructions */}
      <div className="absolute bottom-4 w-full text-center pointer-events-none opacity-50 hidden md:block">
        <p className="text-slate-700 text-sm font-semibold">← Move Left | Move Right →</p>
      </div>
    </div>
  );
};

export default App;