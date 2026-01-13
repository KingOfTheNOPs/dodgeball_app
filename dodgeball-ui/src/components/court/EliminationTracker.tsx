import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { XCircle, RotateCcw, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EliminationTracker({
  losingTeamPlayers,
  onComplete,
  onCancel,
  statusText,
}: {
  losingTeamPlayers: any[];
  onComplete: (order: any[]) => Promise<any> | any;
  onCancel: () => void;
  statusText?: string | null;
}) {
  const [eliminatedOrder, setEliminatedOrder] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEliminate = (player: any) => {
    if (isSubmitting) return;
    setEliminatedOrder([...eliminatedOrder, player]);
  };

  const handleUndo = () => {
    if (isSubmitting) return;
    setEliminatedOrder(eliminatedOrder.slice(0, -1));
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      // Paint overlay before parent starts the heavy async work
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      await Promise.resolve(onComplete(eliminatedOrder));
    } finally {
      setIsSubmitting(false);
    }
  };

  const remainingPlayers = losingTeamPlayers.filter(
    (p: any) => !eliminatedOrder.find((e: any) => e.id === p.id)
  );

  return (
    <Card className="relative border-0 shadow-2xl bg-gradient-to-br from-rose-50 to-red-50">
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 rounded-xl bg-white/70 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="text-center px-6">
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="h-6 w-6 text-slate-700 animate-spin" />
                <p className="text-slate-800 font-semibold">
                  {statusText ?? "Processing…"}
                </p>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Determining the next challenger and recording elimination order.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-rose-800">
          <XCircle className="h-5 w-5" />
          Track Elimination Order
        </CardTitle>
        <p className="text-sm text-rose-600 mt-1">
          Click players in the order they were eliminated
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-600 uppercase">Elimination Order</p>
          <div className="min-h-[60px] bg-white rounded-lg p-3 border-2 border-rose-200">
            {eliminatedOrder.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-2">
                Click players below to track order
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {eliminatedOrder.map((player: any, index: number) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Badge className="bg-rose-500 hover:bg-rose-500 text-white px-3 py-1">
                      {index + 1}. {player.name}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-600 uppercase">
            Remaining Players ({remainingPlayers.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <AnimatePresence>
              {remainingPlayers.map((player: any) => (
                <motion.button
                  key={player.id}
                  onClick={() => handleEliminate(player)}
                  disabled={isSubmitting}
                  initial={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={[
                    "flex items-center gap-2 p-3 bg-white rounded-lg border-2 border-slate-200 transition-all",
                    isSubmitting ? "opacity-60 cursor-not-allowed" : "hover:border-rose-400",
                  ].join(" ")}
                >
                  <div className={`h-8 w-8 rounded-lg ${player.avatar_color} flex items-center justify-center text-white text-sm font-bold`}>
                    {player.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700 truncate">
                    {player.name}
                  </span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>

          {eliminatedOrder.length > 0 && (
            <Button
              variant="outline"
              onClick={handleUndo}
              disabled={isSubmitting}
              className="border-slate-300"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Undo
            </Button>
          )}

          <Button
            onClick={handleComplete}
            disabled={isSubmitting || eliminatedOrder.length !== losingTeamPlayers.length}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete ({eliminatedOrder.length}/{losingTeamPlayers.length})
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
