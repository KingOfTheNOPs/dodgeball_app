import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUp, ArrowDown, Trash2, Flame, Trophy, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QueueList({ players, onMoveUp, onMoveDown, onDelete }) {
  if (!players || players.length === 0) {
    return (
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-400" />
            Queue (0 players)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <Clock className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p>No players in queue</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const queuePlayers = players.filter((p, idx) => idx >= 6);

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-slate-400" />
          Queue ({queuePlayers.length} waiting)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <div className="px-6 pb-6 space-y-2">
            <AnimatePresence>
              {queuePlayers.map((player, index) => {
                const actualPosition = index + 6;
                return (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all group"
                  >
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-slate-200 text-slate-600 font-bold text-sm">
                      {actualPosition + 1}
                    </div>
                    
                    <div className={`h-10 w-10 rounded-lg ${player.avatar_color} flex items-center justify-center text-white text-lg font-bold shadow-md`}>
                      {player.name?.charAt(0)?.toUpperCase()}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-800 truncate">{player.name}</p>
                        {player.current_streak > 0 && (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                            <Flame className="h-3 w-3 mr-1" />
                            {player.current_streak}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Trophy className="h-3 w-3" />
                          {player.total_wins}W-{player.total_losses}L
                        </span>
                        {player.highest_streak > 0 && (
                          <span className="text-amber-600">Best: {player.highest_streak}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => onMoveUp(player)}
                        disabled={actualPosition === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => onMoveDown(player)}
                        disabled={actualPosition === players.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        size="queueIcon"
                        variant="queueIconGhost"
                        onClick={() => onDelete(player)}
                        aria-label={`Remove ${player.name}`}
                        title="Remove"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {queuePlayers.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <p className="text-sm">All players are active</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}