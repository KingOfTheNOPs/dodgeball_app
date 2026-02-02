import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Swords, Flame, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TeamCard({ team, players, streak, onDelete }) {
  const isWinnersCourt = team === 'winners_court';
  const showChallengerDelete = team === 'challenger' && !!onDelete;
  
  return (
    <Card className={`border-0 shadow-xl ${
      isWinnersCourt 
        ? 'bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600' 
        : 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900'
    } text-white`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            {isWinnersCourt ? (
              <Crown className="h-6 w-6" />
            ) : (
              <Swords className="h-6 w-6" />
            )}
            <span>{isWinnersCourt ? "Winner's Court" : "Challenger"}</span>
          </div>
          {isWinnersCourt && streak > 0 && (
            <Badge className="bg-orange-600 hover:bg-orange-600 text-white">
              <Flame className="h-3 w-3 mr-1" />
              {streak} Win{streak !== 1 ? 's' : ''}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {players.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <p>No players assigned</p>
            <p className="text-sm mt-1">Add at least 12 players to start</p>
          </div>
        ) : (
          <div className="space-y-2">
            {players.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-3 group"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg ${player.avatar_color} flex items-center justify-center text-white text-lg font-bold shadow-lg flex-shrink-0`}>
                    {player.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base">{player.name}</p>
                    <p className="text-xs text-white/60">Position {index + 1}</p>
                  </div>
                  {showChallengerDelete && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10 transition"
                      onClick={() => onDelete(player)}
                      aria-label={`Remove ${player.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
