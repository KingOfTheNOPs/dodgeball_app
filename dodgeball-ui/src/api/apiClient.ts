// src/api/apiClient.ts
import { base44 } from '@/api/base44Client';
import { offlineStore, compactOpLog, getRemoteId, setRemoteId, type OpLogEntry } from './offlineStore';

let syncing = false;
let syncQueued = false;

function isOnline() {
  // navigator.onLine isn't perfect, but good enough as a trigger
  return typeof navigator !== 'undefined' ? navigator.onLine : false;
}

async function getLocalPlayer(localId: string) {
  const players = await offlineStore.entities.Player.list();
  return players.find(player => player.id === localId) ?? null;
}

async function getLocalGame(localId: string) {
  const games = await offlineStore.entities.Game.list();
  return games.find(game => game.id === localId) ?? null;
}

async function syncOnce() {
  if (syncing) {
    syncQueued = true;
    return;
  }
  if (!isOnline()) return;

  const raw = offlineStore.oplog.get();
  if (raw.length === 0) return;

  syncing = true;
  try {
    const entries = compactOpLog(raw);

    // We’ll attempt sync in order. If any op fails, we stop and keep remaining.
    const remaining: OpLogEntry[] = [];

    for (const op of entries) {
      try {
        if (op.entity === 'Player') {
          await syncPlayerOp(op);
        } else if (op.entity === 'Game') {
          await syncGameOp(op);
        }
      } catch (e) {
        // Keep this and any ops after it for next time
        remaining.push(op, ...entries.slice(entries.indexOf(op) + 1));
        break;
      }
    }

    // Rebuild oplog: keep only remaining (if any)
    // NOTE: If raw contained multiple ops for same id, compactOpLog already reduced it.
    offlineStore.oplog.set(remaining);
  } finally {
    syncing = false;
  }

  if (syncQueued) {
    syncQueued = false;
    await syncOnce();
  }
}

async function syncPlayerOp(op: OpLogEntry) {
  const localId = op.id;
  const remoteId = getRemoteId('Player', localId);

  if (op.op === 'create') {
    // create remote, store mapping
    const created = await base44.entities.Player.create(op.data);
    setRemoteId('Player', localId, created.id);
    return;
  }

  // If we don't have a remote id yet, we can't update/delete remotely.
  // This can happen if create hasn't synced yet — leave op in oplog (handled by syncOnce).
  if (!remoteId) {
    if (op.op === 'update') {
      const localPlayer = await getLocalPlayer(localId);
      if (!localPlayer) return;
      const created = await base44.entities.Player.create(localPlayer);
      setRemoteId('Player', localId, created.id);
      return;
    }

    if (op.op === 'delete') {
      return;
    }

    throw new Error(`Missing remote id mapping for Player ${localId}`);
  }

  if (op.op === 'update') {
    await base44.entities.Player.update(remoteId, op.data);
    return;
  }

  if (op.op === 'delete') {
    await base44.entities.Player.delete(remoteId);
    return;
  }
}

async function syncGameOp(op: OpLogEntry) {
  const localId = op.id;
  const remoteId = getRemoteId('Game', localId);

  if (op.op === 'create') {
    const created = await base44.entities.Game.create(op.data);
    setRemoteId('Game', localId, created.id);
    return;
  }

  if (!remoteId) {
    if (op.op === 'update') {
      const localGame = await getLocalGame(localId);
      if (!localGame) return;
      const created = await base44.entities.Game.create(localGame);
      setRemoteId('Game', localId, created.id);
      return;
    }

    if (op.op === 'delete') {
      return;
    }

    throw new Error(`Missing remote id mapping for Game ${localId}`);
  }

  if (op.op === 'delete') {
    await base44.entities.Game.delete(remoteId);
    return;
  }

  // You don't currently update games in your UI; ignore if it appears
  if (op.op === 'update') {
    // If you ever add Game.update, implement it here.
    await base44.entities.Game.update(remoteId, op.data);
  }
}

// Try to sync when we come online
if (typeof window !== 'undefined') {
  void syncOnce();
  window.addEventListener('online', () => {
    void syncOnce();
  });
}

const entities = {
  Player: {
    list: offlineStore.entities.Player.list,
    create: async (data: Parameters<typeof offlineStore.entities.Player.create>[0]) => {
      const created = await offlineStore.entities.Player.create(data);
      void syncOnce();
      return created;
    },
    update: async (id: string, patch: Parameters<typeof offlineStore.entities.Player.update>[1]) => {
      const updated = await offlineStore.entities.Player.update(id, patch);
      void syncOnce();
      return updated;
    },
    delete: async (id: string) => {
      const result = await offlineStore.entities.Player.delete(id);
      void syncOnce();
      return result;
    },
  },
  Game: {
    list: offlineStore.entities.Game.list,
    create: async (data: Parameters<typeof offlineStore.entities.Game.create>[0]) => {
      const created = await offlineStore.entities.Game.create(data);
      void syncOnce();
      return created;
    },
    delete: async (id: string) => {
      const result = await offlineStore.entities.Game.delete(id);
      void syncOnce();
      return result;
    },
  },
};

// Export an API surface that matches your existing usage pattern
export const api = {
  entities,

  // Optional: call this manually if you want a "Sync" button later
  syncNow: async () => {
    await syncOnce();
  },

  // Optional: for UI indicators
  isOnline: () => isOnline(),
  isSyncing: () => syncing,
};
