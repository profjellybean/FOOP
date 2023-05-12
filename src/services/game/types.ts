export type GameSettings = {
  multiplayer: boolean;
  networked: boolean;
};

export enum GameStatus {
  initial,
  started,
  finished,
  paused,
  error
}

export type GameContext = {
  status: GameStatus;
  gameId: string;
  players?: PlayerMap;
}

export type PlayerMap = {
  [key: string]: PlayerMeta
}

export type PlayerMeta = {
  id: string;
  ready: boolean
}