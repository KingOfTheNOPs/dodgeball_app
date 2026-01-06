import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingDown, Flame, Users, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ActiveTeam({ activePlayers, onWin, onLoss, isLoading }) {
  if (!activePlayers || activePlayers.length === 0) {
    return (
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Active Team (0/6)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <Users className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p>No players in queue</p>
            <p className="text-sm text-slate-400 mt-1">Add players to start</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-400" />
            <span>Active Team ({activePlayers.length}/6)</span>
          </div>
          {activePlayers.length === 6 && (
            <Badge className="bg-emerald-500 hover:bg-emerald-500">
              Ready to Play
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {activePlayers.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 space-y-2 hover:bg-white/15 transition-all group">
                <div className="flex items-center gap-2">
                  <div className={`h-10 w-10 rounded-lg ${player.avatar_color} flex items-center justify-center text-white text-lg font-bold shadow-lg`}>
                    {player.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-sm">{player.name}</p>
                    <p className="text-xs text-white/60">Pos {index + 1}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {player.current_streak > 0 && (
                    <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">
                      <Flame className="h-3 w-3 mr-1" />
                      {player.current_streak}
                    </Badge>
                  )}
                  <span className="text-xs text-white/60">
                    {player.total_wins}W-{player.total_losses}L
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => onWin(player)}
                    disabled={isLoading}
                    className="h-8 bg-emerald-500 hover:bg-emerald-600 text-white text-xs"
                  >
                    <Trophy className="h-3 w-3 mr-1" />
                    Win
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onLoss(player)}
                    disabled={isLoading}
                    className="h-8 border-rose-400/50 text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 text-xs"
                  >
                    <TrendingDown className="h-3 w-3 mr-1" />
                    Loss
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Empty slots */}
          {Array.from({ length: 6 - activePlayers.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border-2 border-dashed border-white/20 flex items-center justify-center"
            >
              <p className="text-white/40 text-sm">Empty</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}