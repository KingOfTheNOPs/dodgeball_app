import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Trophy, TrendingUp, Users, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const avatarColors = [
  'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-sky-500',
  'bg-violet-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
];

export default function TeamCard({ team, onWin, onLoss, onRotate, isLoading }) {
  const currentPlayer = team.members?.[team.current_player_index || 0];
  const memberCount = team.members?.length || 0;

  const getNextPlayer = () => {
    if (!team.members?.length) return null;
    const nextIndex = ((team.current_player_index || 0) + 1) % team.members.length;
    return team.members[nextIndex];
  };

  return (
    <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white">
      <CardHeader className="pb-0 pt-6 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">{team.name}</h3>
              <p className="text-sm text-white/70">{memberCount} members</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {team.current_streak > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white"
              >
                <Flame className="h-4 w-4 text-white" />
                <span className="font-bold text-sm">{team.current_streak}</span>
              </motion.div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-xl bg-white/10">
            <div className="flex items-center justify-center gap-1 text-white/90 mb-1">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{team.highest_streak || 0}</p>
            <p className="text-xs text-white/70">Best Streak</p>
          </div>

          <div className="text-center p-3 rounded-xl bg-white/10">
            <p className="text-2xl font-bold text-white">{team.total_wins || 0}</p>
            <p className="text-xs text-white/70">Wins</p>
          </div>

          <div className="text-center p-3 rounded-xl bg-white/10">
            <p className="text-2xl font-bold text-white">{team.total_losses || 0}</p>
            <p className="text-xs text-white/70">Losses</p>
          </div>
        </div>

        {/* Current Player Rotation */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-white/70 uppercase tracking-wider">Now Playing</p>

          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-white hover:bg-white/10 hover:text-white"
              onClick={() => onRotate(-1)}
              disabled={memberCount < 2}
            >
              <ChevronLeft className="h-4 w-4 text-white" />
            </Button>

            <AnimatePresence mode="wait">
              <motion.div
                key={team.current_player_index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center"
              >
                <div
                  className={`h-16 w-16 rounded-2xl ${
                    currentPlayer?.avatar_color || avatarColors[0]
                  } flex items-center justify-center text-white text-2xl font-bold shadow-lg`}
                >
                  {currentPlayer?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>

                <p className="mt-2 font-semibold text-white">{currentPlayer?.name || 'No player'}</p>
                <p className="text-xs text-white/70">
                  {(team.current_player_index || 0) + 1} of {memberCount}
                </p>
              </motion.div>
            </AnimatePresence>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-white hover:bg-white/10 hover:text-white"
              onClick={() => onRotate(1)}
              disabled={memberCount < 2}
            >
              <ChevronRight className="h-4 w-4 text-white" />
            </Button>
          </div>

          {/* Next Up Preview */}
          {memberCount > 1 && (
            <div className="flex items-center justify-center gap-2 text-sm text-white/70">
              <span>Next:</span>
              <span className="font-medium text-white">{getNextPlayer()?.name}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            onClick={onWin}
            disabled={isLoading || !currentPlayer}
            className="h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200/20 transition-all hover:scale-[1.02]"
          >
            <TrendingUp className="h-5 w-5 mr-2 text-white" />
            Win
          </Button>

          <Button
            onClick={onLoss}
            disabled={isLoading || !currentPlayer}
            variant="outline"
            className="h-14 border-2 border-white/30 text-white hover:bg-white/10 hover:text-white font-semibold rounded-xl transition-all hover:scale-[1.02]"
          >
            Loss
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
