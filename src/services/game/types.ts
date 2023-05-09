export type GameSettings = {
  multiplayer: boolean;
  networked: boolean;
};

export type GameContext = {
  started: boolean;
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