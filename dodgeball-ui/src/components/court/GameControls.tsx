import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Crown, Swords } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GameControls({ 
  winnersCourtCount, 
  challengerCount, 
  onWinnersCourtWins, 
  onChallengerWins,
  isLoading 
}) {
  const canPlay = winnersCourtCount === 6 && challengerCount === 6;

  if (!canPlay) {
    return (
      <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-100 to-slate-200">
        <CardContent className="p-8 text-center">
          <Trophy className="h-16 w-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-xl font-bold text-slate-600 mb-2">Waiting for Players</h3>
          <p className="text-slate-500">
            Need 12 players to start (6 per team)
          </p>
          <div className="mt-4 space-y-1 text-sm">
            <p className="text-slate-600">Winner's Court: {winnersCourtCount}/6</p>
            <p className="text-slate-600">Challenger: {challengerCount}/6</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardContent className="p-6 space-y-4">
        <div className="text-center">
          <Trophy className="h-12 w-12 mx-auto mb-3 text-indigo-600" />
          <h3 className="text-xl font-bold text-slate-800 mb-1">Record Game Result</h3>
          <p className="text-slate-600 text-sm">Who won this round?</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={onWinnersCourtWins}
              disabled={isLoading}
              className="w-full h-24 bg-gradient-to-br from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white shadow-lg flex flex-col gap-2"
            >
              <Crown className="h-8 w-8" />
              <span className="font-bold">Winner's Court</span>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={onChallengerWins}
              disabled={isLoading}
              className="w-full h-24 bg-gradient-to-br from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black text-white shadow-lg flex flex-col gap-2"
            >
              <Swords className="h-8 w-8" />
              <span className="font-bold">Challenger</span>
            </Button>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}