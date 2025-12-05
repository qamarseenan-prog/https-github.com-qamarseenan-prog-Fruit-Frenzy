import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameStatus, FruitEntity, ScoreData } from '../types';
import { FRUIT_TYPES, BASKET_EMOJI, INITIAL_LIVES, BASE_SPEED } from '../constants';

interface GameCanvasProps {
  status: GameStatus;
  onGameOver: (data: ScoreData) => void;
  onScoreUpdate: (score: number) => void;
  onLivesUpdate: (lives: number) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  status,
  onGameOver,
  onScoreUpdate,
  onLivesUpdate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Fix: Initialize useRef with null to satisfy "Expected 1 arguments" error
  const requestRef = useRef<number | null>(null);
  
  // Game State Refs (for performance without re-renders)
  const gameState = useRef({
    basketX: 0, // 0 to 1 (normalized width)
    fruits: [] as FruitEntity[],
    score: 0,
    lives: INITIAL_LIVES,
    lastSpawnTime: 0,
    caughtCount: 0,
    missedCount: 0,
    gameTime: 0,
    canvasWidth: 0,
    canvasHeight: 0,
  });

  // Handle Input
  const handleInput = useCallback((clientX: number) => {
    if (status !== GameStatus.PLAYING || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    // Clamp between 0.05 and 0.95 to keep basket mostly on screen
    const normalizedX = Math.max(0.05, Math.min(0.95, relativeX / rect.width));
    gameState.current.basketX = normalizedX;
  }, [status]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleInput(e.clientX);
    const handleTouchMove = (e: TouchEvent) => handleInput(e.touches[0].clientX);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== GameStatus.PLAYING) return;
      if (e.key === 'ArrowLeft') {
        gameState.current.basketX = Math.max(0.05, gameState.current.basketX - 0.05);
      } else if (e.key === 'ArrowRight') {
        gameState.current.basketX = Math.min(0.95, gameState.current.basketX + 0.05);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [status, handleInput]);

  // Game Loop
  const update = useCallback((time: number) => {
    if (status !== GameStatus.PLAYING) return;

    const state = gameState.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Responsive Canvas Sizing
    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
       canvas.width = canvas.clientWidth;
       canvas.height = canvas.clientHeight;
       state.canvasWidth = canvas.width;
       state.canvasHeight = canvas.height;
    }

    const { width, height } = canvas;
    
    // Clear
    ctx.clearRect(0, 0, width, height);

    // Spawn Fruits
    // Difficulty increases with score: faster spawn, faster fall
    const difficultyMultiplier = 1 + (state.score / 500); 
    const spawnRate = Math.max(400, 1000 / difficultyMultiplier);

    if (time - state.lastSpawnTime > spawnRate) {
      const typeInfo = FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)];
      state.fruits.push({
        id: Date.now() + Math.random(),
        x: Math.random() * 0.9 + 0.05, // Random X (5% to 95%)
        y: -50, // Start above screen
        type: typeInfo.emoji,
        points: typeInfo.points,
        speed: (typeInfo.speed * BASE_SPEED * difficultyMultiplier) + (Math.random() * 2),
      });
      state.lastSpawnTime = time;
    }

    // Update Fruits
    for (let i = state.fruits.length - 1; i >= 0; i--) {
      const f = state.fruits[i];
      f.y += f.speed;

      // Draw Fruit
      ctx.font = '32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(f.type, f.x * width, f.y);

      // Collision Detection
      const basketY = height - 60;
      const basketXPx = state.basketX * width;
      const hitDistance = 40; // Pixel radius for catch

      // Check Catch
      if (
        f.y > basketY - 20 && 
        f.y < basketY + 40 &&
        Math.abs((f.x * width) - basketXPx) < hitDistance
      ) {
        // CAUGHT!
        state.score += f.points;
        state.caughtCount++;
        state.fruits.splice(i, 1);
        onScoreUpdate(state.score);
        
        // Visual Pop Effect (Simple text pulse could go here, but keeping it simple)
        continue;
      }

      // Check Missed
      if (f.y > height + 20) {
        state.fruits.splice(i, 1);
        state.lives--;
        state.missedCount++;
        onLivesUpdate(state.lives);
        
        if (state.lives <= 0) {
          onGameOver({
            caught: state.caughtCount,
            missed: state.missedCount,
            score: state.score
          });
          return; // Stop loop
        }
      }
    }

    // Draw Basket
    const basketXPx = state.basketX * width;
    ctx.font = '64px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    // Add a slight wobble effect based on movement or time
    const wobble = Math.sin(time / 200) * 0.05;
    
    ctx.save();
    ctx.translate(basketXPx, height - 10);
    ctx.rotate(wobble);
    ctx.fillText(BASKET_EMOJI, 0, 0);
    ctx.restore();
    
    // Debug / Helper line
    // ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    // ctx.beginPath();
    // ctx.moveTo(basketXPx, 0);
    // ctx.lineTo(basketXPx, height);
    // ctx.stroke();

    requestRef.current = requestAnimationFrame(update);
  }, [status, onScoreUpdate, onLivesUpdate, onGameOver]);

  // Start/Stop Loop
  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      // Reset state on start if needed (usually handled by parent resetting Play state, 
      // but if we resume, we keep state. If we restart, we need to reset.)
      if (gameState.current.score > 0 && gameState.current.lives <= 0) {
         // This is a restart
         gameState.current = {
            ...gameState.current,
            score: 0,
            lives: INITIAL_LIVES,
            fruits: [],
            caughtCount: 0,
            missedCount: 0,
            lastSpawnTime: 0,
            basketX: 0.5
         };
         onScoreUpdate(0);
         onLivesUpdate(INITIAL_LIVES);
      }
      
      requestRef.current = requestAnimationFrame(update);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [status, update, onScoreUpdate, onLivesUpdate]);

  // Reset helper exposed via ref if needed, but current logic handles auto-reset on game over -> playing transition mostly.
  // Actually, let's just ensure when we switch to Playing from Game Over, we clean up.
  useEffect(() => {
      if (status === GameStatus.IDLE) {
          gameState.current.score = 0;
          gameState.current.lives = INITIAL_LIVES;
          gameState.current.fruits = [];
          onScoreUpdate(0);
          onLivesUpdate(INITIAL_LIVES);
      }
  }, [status, onScoreUpdate, onLivesUpdate]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block touch-none cursor-none"
    />
  );
};

export default GameCanvas;