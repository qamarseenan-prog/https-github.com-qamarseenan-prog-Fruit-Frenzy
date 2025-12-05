export interface GameConfig {
  speedMultiplier: number;
  spawnRate: number;
  maxMissed: number;
}

export interface FruitEntity {
  id: number;
  x: number;
  y: number;
  type: string; // Emoji char
  points: number;
  speed: number;
}

export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
}

export interface ScoreData {
  caught: number;
  missed: number;
  score: number;
}