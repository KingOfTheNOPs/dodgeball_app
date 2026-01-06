import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, ArrowUp, ArrowDown, Trash2, Trophy, Flame } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';

export default function QueuePanel({ players, onMoveUp, onMoveDown, onDelete }) {
  if (!players || players.length === 0) {
    return (
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-400" />
            Waiting Queue (0)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <Clock className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p>No players waiting</p>
            <p className="text-sm text-slate-400 mt-1">Need 12+ players for queue</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-slate-400" />
          Waiting Queue ({players.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="px-6 pb-6 space-y-2">
            {players.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all group"
              >
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-slate-200 text-slate-600 font-bold text-sm">
                  {index + 1}
                </div>
                
                <div className={`h-10 w-10 rounded-lg ${player.avatar_color} flex items-center justify-center text-white text-lg font-bold shadow-md`}>
                  {player.name?.charAt(0)?.toUpperCase()}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{player.name}</p>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => onMoveUp(player)}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => onMoveDown(player)}
                    disabled={index === players.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                    onClick={() => onDelete(player)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}