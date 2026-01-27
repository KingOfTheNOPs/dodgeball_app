import React, { useEffect, useState } from 'react';
import { CloudOff, Cloud, RefreshCw, AlertTriangle } from 'lucide-react';
import { api } from '@/api/apiClient';
import { offlineStore } from '@/api/offlineStore';

type Status = 'offline' | 'online' | 'syncing' | 'dirty';

export default function SyncStatus() {
  const [status, setStatus] = useState<Status>('offline');
  const [unsyncedCount, setUnsyncedCount] = useState(0);

  const recompute = () => {
    const online = api.isOnline();
    const syncing = api.isSyncing();
    const dirty = offlineStore.oplog.get().length > 0;

    setUnsyncedCount(offlineStore.oplog.get().length);

    if (syncing) setStatus('syncing');
    else if (!online) setStatus('offline');
    else if (dirty) setStatus('dirty');
    else setStatus('online');
  };

  useEffect(() => {
    recompute();

    const onOnline = () => recompute();
    const onOffline = () => recompute();

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    const interval = setInterval(recompute, 1500);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      clearInterval(interval);
    };
  }, []);

  const handleManualSync = async () => {
    await api.syncNow();
    recompute();
  };

  const baseClass =
    'flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold shadow-sm border';

  if (status === 'syncing') {
    return (
      <div className={`${baseClass} bg-indigo-50 text-indigo-700 border-indigo-200`}>
        <RefreshCw className="h-3 w-3 animate-spin" />
        Syncing…
      </div>
    );
  }

  if (status === 'offline') {
    return (
      <div className={`${baseClass} bg-slate-100 text-slate-600 border-slate-300`}>
        <CloudOff className="h-3 w-3" />
        Offline mode
      </div>
    );
  }

  if (status === 'dirty') {
    return (
      <button
        onClick={handleManualSync}
        className={`${baseClass} bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100 transition`}
        title="Saved locally — click to retry sync"
      >
        <AlertTriangle className="h-3 w-3" />
        {unsyncedCount} pending
      </button>
    );
  }

  return (
    <div className={`${baseClass} bg-emerald-50 text-emerald-700 border-emerald-200`}>
      <Cloud className="h-3 w-3" />
      All synced
    </div>
  );
}
