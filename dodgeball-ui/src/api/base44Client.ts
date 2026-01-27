type Id = string;

function uid(): Id {
  return Math.random().toString(36).slice(2);
}

type Player = {
  id: Id;
  name: string;
  avatar_color?: string;
  queue_position: number;
  team: "winners_court" | "challenger" | "queue";
};

type Game = any;

const LS_PLAYERS = "dodgeball.players";
const LS_GAMES = "dodgeball.games";

function load<T>(k: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(k) || "") as T; } catch { return fallback; }
}
function save<T>(k: string, v: T) { localStorage.setItem(k, JSON.stringify(v)); }

export const base44 = {
  entities: {
    Player: {
      async list(orderBy?: string) {
        let players = load<Player[]>(LS_PLAYERS, []);
        if (orderBy === "queue_position") players = players.sort((a,b) => a.queue_position - b.queue_position);
        return players;
      },
      async create(data: Omit<Player, "id">) {
        const players = load<Player[]>(LS_PLAYERS, []);
        const p: Player = { id: uid(), ...data };
        const idx = players.findIndex(player => player.id === p.id);
        if (idx >= 0) players[idx] = p;
        else players.push(p);
        save(LS_PLAYERS, players);
        return p;
      },
      async update(id: Id, data: Partial<Player>) {
        const players = load<Player[]>(LS_PLAYERS, []);
        const idx = players.findIndex(p => p.id === id);
        if (idx >= 0) players[idx] = { ...players[idx], ...data };
        save(LS_PLAYERS, players);
        return players[idx];
      },
      async delete(id: Id) {
        const players = load<Player[]>(LS_PLAYERS, []).filter(p => p.id !== id);
        save(LS_PLAYERS, players);
      },
    },
    Game: {
      async list() { return load<Game[]>(LS_GAMES, []); },
      async create(data: Game) {
        const games = load<any[]>(LS_GAMES, []);
        const game = { id: uid(), created_date: new Date().toISOString(), ...data };
        const idx = games.findIndex((g: any) => g.id === game.id);
        if (idx >= 0) games[idx] = game;
        else games.unshift(game);
        save(LS_GAMES, games);
        return game;
      },
      async delete(id: Id) {
        const games = load<any[]>(LS_GAMES, []).filter(g => g.id !== id);
        save(LS_GAMES, games);
      },
    },
  },
};
