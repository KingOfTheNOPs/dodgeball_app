// src/api/offlineStore.ts
// Offline-first store + operation log + remote-id mapping for hybrid sync.

export type Team = 'winners_court' | 'challenger' | 'queue';

export type Player = {
  id: string; // local id
  name: string;
  avatar_color: string;
  queue_position: number;
  team: Team;
  created_date?: string;
  updated_date?: string;
};

export type Game = {
  id: string; // local id
  created_date: string;
  winning_team: string;
  losing_team: string;
  winners_court_players: string[];
  challenger_players: string[];
  eliminated_players: Array<{
    player_id: string;
    player_name: string;
    elimination_order: number;
  }>;
  winners_court_streak: number;
};

type EntityName = 'Player' | 'Game';
type OpType = 'create' | 'update' | 'delete';

export type OpLogEntry = {
  ts: number;
  entity: EntityName;
  op: OpType;
  id: string; // local id
  data?: any; // create payload or update patch
};

const KEYS = {
  players: 'dodgeball.players',
  games: 'dodgeball.games',
  oplog: 'dodgeball.oplog',
  // maps local ids to remote ids after sync
  idmap: 'dodgeball.idmap', // { Player: { [localId]: remoteId }, Game: { ... } }
};

function nowISO() {
  return new Date().toISOString();
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function genId(prefix: string) {
  const uuid =
    (globalThis.crypto as any)?.randomUUID?.() ??
    `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
  return `${prefix}_${uuid}`;
}

// ---------- In-memory helpers over localStorage ----------

function readPlayers(): Player[] {
  return safeParse<Player[]>(localStorage.getItem(KEYS.players), []);
}
function writePlayers(players: Player[]) {
  localStorage.setItem(KEYS.players, JSON.stringify(players));
}

function readGames(): Game[] {
  return safeParse<Game[]>(localStorage.getItem(KEYS.games), []);
}
function writeGames(games: Game[]) {
  localStorage.setItem(KEYS.games, JSON.stringify(games));
}

function readOpLog(): OpLogEntry[] {
  return safeParse<OpLogEntry[]>(localStorage.getItem(KEYS.oplog), []);
}
function writeOpLog(entries: OpLogEntry[]) {
  localStorage.setItem(KEYS.oplog, JSON.stringify(entries));
}
function appendOpLog(entry: OpLogEntry) {
  const oplog = readOpLog();
  oplog.push(entry);
  writeOpLog(oplog);
}

type IdMap = {
  Player: Record<string, string>;
  Game: Record<string, string>;
};

function readIdMap(): IdMap {
  return safeParse<IdMap>(localStorage.getItem(KEYS.idmap), { Player: {}, Game: {} });
}

function writeIdMap(map: IdMap) {
  localStorage.setItem(KEYS.idmap, JSON.stringify(map));
}

export function getRemoteId(entity: EntityName, localId: string): string | null {
  const map = readIdMap();
  return map[entity]?.[localId] ?? null;
}

export function setRemoteId(entity: EntityName, localId: string, remoteId: string) {
  const map = readIdMap();
  map[entity] = map[entity] || {};
  map[entity][localId] = remoteId;
  writeIdMap(map);
}

export function clearAllOfflineData() {
  localStorage.removeItem(KEYS.players);
  localStorage.removeItem(KEYS.games);
  localStorage.removeItem(KEYS.oplog);
  localStorage.removeItem(KEYS.idmap);
}

// ---------- OpLog compaction to avoid sync headaches ----------
// This reduces the oplog so "create then update" merges, "create then delete" disappears, etc.
export function compactOpLog(entries: OpLogEntry[]): OpLogEntry[] {
  // Group by entity+id
  const byKey = new Map<string, OpLogEntry[]>();
  for (const e of entries) {
    const key = `${e.entity}:${e.id}`;
    const arr = byKey.get(key) ?? [];
    arr.push(e);
    byKey.set(key, arr);
  }

  const compacted: OpLogEntry[] = [];

  for (const [, ops] of byKey) {
    ops.sort((a, b) => a.ts - b.ts);

    // Combine operations into a single final intent when possible
    let state: OpLogEntry | null = null;

    for (const op of ops) {
      if (!state) {
        state = { ...op, data: op.data ? { ...op.data } : op.data };
        continue;
      }

      // If we already have a delete, nothing after matters
      if (state.op === 'delete') continue;

      if (state.op === 'create') {
        if (op.op === 'update') {
          // merge patch into create data
          state.data = { ...(state.data ?? {}), ...(op.data ?? {}) };
        } else if (op.op === 'delete') {
          // create then delete => drop entirely
          state = null;
        }
        continue;
      }

      if (state.op === 'update') {
        if (op.op === 'update') {
          state.data = { ...(state.data ?? {}), ...(op.data ?? {}) };
        } else if (op.op === 'delete') {
          state = { ...op, data: undefined };
        }
        continue;
      }
    }

    if (state) compacted.push(state);
  }

  // Return in stable order (by timestamp)
  compacted.sort((a, b) => a.ts - b.ts);
  return compacted;
}

// ---------- Sorting helper (matching how you used base44 list) ----------
type SortKey = string; // "queue_position" or "-created_date"
function sortByKey<T extends Record<string, any>>(items: T[], sortKey?: SortKey): T[] {
  if (!sortKey) return items;
  const desc = sortKey.startsWith('-');
  const key = desc ? sortKey.slice(1) : sortKey;

  const arr = [...items];
  arr.sort((a, b) => {
    const av = a[key];
    const bv = b[key];

    if (typeof av === 'number' && typeof bv === 'number') {
      return desc ? bv - av : av - bv;
    }

    const as = (av ?? '').toString();
    const bs = (bv ?? '').toString();
    return desc ? bs.localeCompare(as) : as.localeCompare(bs);
  });
  return arr;
}

// ---------- Offline-first entity API ----------
export const offlineStore = {
  oplog: {
    get(): OpLogEntry[] {
      return readOpLog();
    },
    set(entries: OpLogEntry[]) {
      writeOpLog(entries);
    },
    clear() {
      writeOpLog([]);
    },
  },

  entities: {
    Player: {
      async list(sortKey?: SortKey) {
        return sortByKey(readPlayers(), sortKey);
      },

      async create(data: Omit<Player, 'id' | 'created_date' | 'updated_date'>) {
        const players = readPlayers();
        const player: Player = {
          id: genId('player'),
          created_date: nowISO(),
          updated_date: nowISO(),
          ...data,
        };
        players.push(player);
        writePlayers(players);

        appendOpLog({ ts: Date.now(), entity: 'Player', op: 'create', id: player.id, data: player });
        return player;
      },

      async update(id: string, patch: Partial<Player>) {
        const players = readPlayers();
        const idx = players.findIndex(p => p.id === id);
        if (idx === -1) throw new Error(`Player not found: ${id}`);

        const updated: Player = { ...players[idx], ...patch, updated_date: nowISO() };
        players[idx] = updated;
        writePlayers(players);

        appendOpLog({ ts: Date.now(), entity: 'Player', op: 'update', id, data: patch });
        return updated;
      },

      async delete(id: string) {
        const players = readPlayers();
        writePlayers(players.filter(p => p.id !== id));

        appendOpLog({ ts: Date.now(), entity: 'Player', op: 'delete', id });
        return { ok: true };
      },
    },

    Game: {
      async list(sortKey?: SortKey, limit?: number) {
        const games = sortByKey(readGames(), sortKey);
        return typeof limit === 'number' ? games.slice(0, limit) : games;
      },

      async create(data: Omit<Game, 'id' | 'created_date'>) {
        const games = readGames();
        const game: Game = {
          id: genId('game'),
          created_date: nowISO(),
          ...data,
        };
        games.unshift(game);
        writeGames(games);

        appendOpLog({ ts: Date.now(), entity: 'Game', op: 'create', id: game.id, data: game });
        return game;
      },

      async delete(id: string) {
        const games = readGames();
        writeGames(games.filter(g => g.id !== id));

        appendOpLog({ ts: Date.now(), entity: 'Game', op: 'delete', id });
        return { ok: true };
      },
    },
  },
};
