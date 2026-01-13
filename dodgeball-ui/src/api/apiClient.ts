// src/api/apiClient.ts
import { base44 } from '@/api/base44Client';
import { offlineStore, compactOpLog, getRemoteId, setRemoteId, type OpLogEntry } from './offlineStore';

let syncing = false;

function isOnline() {
  // navigator.onLine isn't perfect, but good enough as a trigger
  return typeof navigator !== 'undefined' ? navigator.onLine : false;
}

async function syncOnce() {
  if (syncing) return;
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
  window.addEventListener('online', () => {
    void syncOnce();
  });
}

// Export an API surface that matches your existing usage pattern
export const api = {
  entities: offlineStore.entities,

  // Optional: call this manually if you want a "Sync" button later
  syncNow: async () => {
    await syncOnce();
  },

  // Optional: for UI indicators
  isOnline: () => isOnline(),
  isSyncing: () => syncing,
};
