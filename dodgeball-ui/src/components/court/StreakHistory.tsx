import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Crown, TrendingUp } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import moment from 'moment';

export default function StreakHistory({ games }) {
  if (!games || games.length === 0) {
    return (
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-amber-500" />
            Winner's Court Streak History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p>No streak history yet</p>
            <p className="text-sm text-slate-400 mt-1">Start playing to track streaks</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get unique streak milestones (when streak changes)
  const streakMilestones = games
    .filter(game => game.winners_court_streak !== undefined)
    .reduce((acc, game) => {
      const lastStreak = acc.length > 0 ? acc[acc.length - 1].streak : null;
      if (lastStreak !== game.winners_court_streak) {
        acc.push({
          streak: game.winners_court_streak,
          date: game.created_date,
          gameId: game.id
        });
      }
      return acc;
    }, [])
    .reverse()
    .slice(0, 10); // Show last 10 streak changes

  const maxStreak = Math.max(...games.map(g => g.winners_court_streak || 0));
  const currentStreak = games[0]?.winners_court_streak || 0;

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-600" />
            Winner's Court Streak History
          </div>
          <Badge className="bg-amber-600 hover:bg-amber-600 text-white">
            Best: {maxStreak} win{maxStreak !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {streakMilestones.map((milestone, index) => (
            <div
              key={milestone.gameId}
              className="flex items-center gap-3 p-3 rounded-lg bg-white border border-amber-200 hover:border-amber-300 transition-all"
            >
              <div className={`flex items-center justify-center h-12 w-12 rounded-lg ${
                milestone.streak === 0 
                  ? 'bg-slate-100 text-slate-600' 
                  : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
              } font-bold text-lg shadow-md`}>
                {milestone.streak}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800">
                  {milestone.streak === 0 ? 'Streak Ended' : `${milestone.streak} Win${milestone.streak !== 1 ? 's' : ''}`}
                </p>
                <p className="text-xs text-slate-500">
                  {moment(milestone.date).fromNow()}
                </p>
              </div>

              {milestone.streak === maxStreak && (
                <Badge className="bg-orange-600 hover:bg-orange-600 text-white">
                  <Flame className="h-3 w-3 mr-1" />
                  Record
                </Badge>
              )}
              
              {index === 0 && milestone.streak > 0 && (
                <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">
                  Current
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}