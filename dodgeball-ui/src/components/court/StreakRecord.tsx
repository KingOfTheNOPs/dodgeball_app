import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Crown } from 'lucide-react';

export default function StreakRecord({ longestStreak, longestStreakPlayers }) {
  if (!longestStreak || longestStreak === 0) {
    return (
      <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Trophy className="h-5 w-5" />
            Tonight's Longest Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <Crown className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p>No record set yet</p>
            <p className="text-sm text-slate-400 mt-1">Play games to set a record</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Tonight's Longest Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-6xl font-bold mb-2">
            {longestStreak}
          </div>
          <p className="text-lg opacity-90">Win{longestStreak !== 1 ? 's' : ''} in a Row</p>
        </div>

        {longestStreakPlayers && longestStreakPlayers.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold opacity-90 text-center">Championship Squad:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {longestStreakPlayers.map((playerName, index) => (
                <div
                  key={index}
                  className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Crown className="h-4 w-4" />
                    <span className="text-sm font-semibold truncate">{playerName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}