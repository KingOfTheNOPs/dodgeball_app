import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trophy, Flame, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StatsOverview({ players }) {
  const totalPlayers = players?.length || 0;
  const activePlayers = players?.filter((_, i) => i < 6).length || 0;
  
  const topStreak = players?.reduce((max, p) => 
    Math.max(max, p.highest_streak || 0), 0
  ) || 0;
  
  const totalGames = players?.reduce((sum, p) => 
    sum + (p.total_wins || 0) + (p.total_losses || 0), 0
  ) || 0;

  const currentStreaks = players?.filter(p => (p.current_streak || 0) > 0).length || 0;

  const stats = [
    { label: 'Total Players', value: totalPlayers, icon: Users, color: 'bg-slate-500' },
    { label: 'In Active Team', value: `${activePlayers}/6`, icon: Trophy, color: 'bg-emerald-500' },
    { label: 'Best Streak Ever', value: topStreak, icon: Flame, color: 'bg-orange-500' },
    { label: 'Total Games', value: totalGames, icon: TrendingUp, color: 'bg-blue-500' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-xl ${stat.color} flex items-center justify-center text-white`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}