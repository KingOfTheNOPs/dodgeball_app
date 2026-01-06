import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, TrendingDown, Clock, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import moment from 'moment';

export default function GameHistory({ games, teams }) {
  const getTeamName = (teamId) => {
    return teams.find(t => t.id === teamId)?.name || 'Unknown Team';
  };

  if (!games?.length) {
    return (
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-400" />
            Recent Games
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <Clock className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p>No games recorded yet</p>
            <p className="text-sm text-slate-400 mt-1">Start playing to see history</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-slate-400" />
          Recent Games
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="px-6 pb-6 space-y-3">
            {games.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-4 p-3 rounded-xl ${
                  game.result === 'win' ? 'bg-emerald-50' : 'bg-rose-50'
                }`}
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  game.result === 'win' 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-rose-500 text-white'
                }`}>
                  {game.result === 'win' ? (
                    <Trophy className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-800 truncate">{game.player_name}</p>
                    {game.streak_at_time > 2 && game.result === 'win' && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                        <Flame className="h-3 w-3 mr-1" />
                        {game.streak_at_time}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {getTeamName(game.team_id)} • {moment(game.created_date).fromNow()}
                  </p>
                </div>
                
                <Badge className={`${
                  game.result === 'win'
                    ? 'bg-emerald-500 hover:bg-emerald-500'
                    : 'bg-rose-500 hover:bg-rose-500'
                } text-white`}>
                  {game.result === 'win' ? 'Win' : 'Loss'}
                </Badge>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}