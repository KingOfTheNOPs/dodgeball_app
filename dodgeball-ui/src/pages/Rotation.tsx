import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Plus, Gamepad2, Trash2, Shuffle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import TeamCard from '@/components/court/TeamCard';
import GameControls from '@/components/court/GameControls';
import EliminationTracker from '@/components/court/EliminationTracker';
import QueuePanel from '@/components/court/QueuePanel';
import AddPlayerModal from '@/components/queue/AddPlayerModal';
import CountdownTimer from '@/components/court/CountdownTimer';
import StreakRecord from '@/components/court/StreakRecord';

export default function Rotation() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<any>(null);
  const [trackingElimination, setTrackingElimination] = useState<any>(null);
  const [winnersCourtStreak, setWinnersCourtStreak] = useState(0);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [longestStreak, setLongestStreak] = useState(0);
  const [longestStreakPlayers, setLongestStreakPlayers] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data: players = [] } = useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      return await base44.entities.Player.list('queue_position');
    },
  });

  const { data: games = [] } = useQuery({
    queryKey: ['games'],
    queryFn: () => base44.entities.Game.list('-created_date', 30),
  });

  const createPlayerMutation = useMutation({
    mutationFn: async (data: any) => {
      const { team, name, avatar_color } = data;

      // Get players in the selected team to find the right position
      const teamPlayers = players.filter((p: any) => p.team === team);
      const queuePosition =
        teamPlayers.length > 0
          ? Math.max(...teamPlayers.map((p: any) => p.queue_position)) + 1
          : (team === 'winners_court' ? 0 : team === 'challenger' ? 6 : 12);

      return await base44.entities.Player.create({
        name,
        avatar_color,
        queue_position: queuePosition,
        team
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast.success('Player added!');
    },
  });

  const updatePlayerMutation = useMutation({
    mutationFn: ({ id, data }: any) => base44.entities.Player.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
  });

  const createGameMutation = useMutation({
    mutationFn: (data: any) => base44.entities.Game.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });

  const deletePlayerMutation = useMutation({
    mutationFn: async (id: any) => {
      await base44.entities.Player.delete(id);
      const remaining = players.filter((p: any) => p.id !== id);

      await Promise.all(
        remaining.map((player: any, index: number) => {
          let team = 'queue';
          if (index < 6) team = 'winners_court';
          else if (index < 12) team = 'challenger';

          return base44.entities.Player.update(player.id, {
            queue_position: index,
            team
          });
        })
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast.success('Player removed');
      setPlayerToDelete(null);
    },
  });

  const resetAllMutation = useMutation({
    mutationFn: async () => {
      // Delete all players
      await Promise.all(players.map((p: any) => base44.entities.Player.delete(p.id)));
      // Optionally delete all games
      await Promise.all(games.map((g: any) => base44.entities.Game.delete(g.id)));
    },
    onSuccess: () => {
      setWinnersCourtStreak(0);
      setLongestStreak(0);
      setLongestStreakPlayers([]);
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['games'] });
      toast.success('All players and games cleared!');
      setShowResetDialog(false);
    },
  });

  // Derived team lists (used in randomizer + UI)
  const winnersCourtPlayers = players.filter((p: any) => p.team === 'winners_court');
  const challengerPlayers = players.filter((p: any) => p.team === 'challenger');
  const queuePlayers = players.filter((p: any) => p.team === 'queue');

  const randomizeTeamsMutation = useMutation({
    mutationFn: async () => {
      // Only randomize the active 12 (winners + challenger)
      const activePlayers = [...winnersCourtPlayers, ...challengerPlayers];

      // Shuffle
      const shuffled = [...activePlayers].sort(() => Math.random() - 0.5);

      // Assign first 6 to Winner's Court, next 6 to Challenger
      await Promise.all(
        shuffled.map((player: any, index: number) => {
          const team = index < 6 ? 'winners_court' : 'challenger';
          return base44.entities.Player.update(player.id, {
            queue_position: index,
            team
          });
        })
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast.success('Teams randomized!');
    },
  });

  // Randomize button gating:
  // Visible always (when players exist), but "disabled-looking" until:
  // - winners court has 6
  // - challenger has 6
  // - queue is empty (0)
  const hasFullCourts = winnersCourtPlayers.length === 6 && challengerPlayers.length === 6;
  const isQueueEmpty = queuePlayers.length === 0;
  const canRandomizeTeams = hasFullCourts && isQueueEmpty && !randomizeTeamsMutation.isPending;

  const getRandomizeDisabledReasons = () => {
    const reasons: string[] = [];

    if (!hasFullCourts) {
      reasons.push(
        `Both courts must be full (6v6). Right now: Winners ${winnersCourtPlayers.length}/6, Challenger ${challengerPlayers.length}/6.`
      );
    }

    if (!isQueueEmpty) {
      reasons.push(`Queue must be empty. Right now: ${queuePlayers.length} player(s) in queue.`);
    }

    return reasons;
  };

  const handleRandomizeClick = () => {
    if (!canRandomizeTeams) {
      const reasons = getRandomizeDisabledReasons();
      toast.error(reasons.join(' '));
      return;
    }
    randomizeTeamsMutation.mutate();
  };

  const handleWinnersCourtWins = () => {
    const challenger = players.filter((p: any) => p.team === 'challenger');
    setTrackingElimination({ losingTeam: 'challenger', players: challenger });
  };

  const handleChallengerWins = () => {
    const winners = players.filter((p: any) => p.team === 'winners_court');
    setTrackingElimination({ losingTeam: 'winners_court', players: winners });
  };

  const handleEliminationComplete = async (eliminatedOrder: any[]) => {
    const { losingTeam } = trackingElimination;
    const winningTeam = losingTeam === 'challenger' ? 'winners_court' : 'challenger';

    const winnersNames = players.filter((p: any) => p.team === 'winners_court').map((p: any) => p.name);
    const challengerNames = players.filter((p: any) => p.team === 'challenger').map((p: any) => p.name);

    // Update streak
    let newStreak = winnersCourtStreak;
    if (winningTeam === 'winners_court') {
      newStreak += 1;
    } else {
      newStreak = 1;
    }
    setWinnersCourtStreak(newStreak);

    // Check record
    if (newStreak > longestStreak) {
      setLongestStreak(newStreak);
      setLongestStreakPlayers(winnersNames);
      toast.success(`🏆 New record streak: ${newStreak} wins!`, { duration: 4000 });
    }

    // Create game record
    await createGameMutation.mutateAsync({
      winning_team: winningTeam,
      losing_team: losingTeam,
      winners_court_players: winnersNames,
      challenger_players: challengerNames,
      eliminated_players: eliminatedOrder.map((player: any, idx: number) => ({
        player_id: player.id,
        player_name: player.name,
        elimination_order: idx + 1
      })),
      winners_court_streak: newStreak
    });

    // Reposition players - losing team to queue FIRST, then form new challenger
    if (losingTeam === 'challenger') {
      const winnersCourt = players.filter((p: any) => p.team === 'winners_court');
      const queue = players.filter((p: any) => p.team === 'queue');

      const newQueuePool = [...queue, ...eliminatedOrder];
      const newChallenger = newQueuePool.slice(0, 6);
      const remainingQueue = newQueuePool.slice(6);

      let position = 0;

      // Winners court stays (0-5)
      for (const player of winnersCourt) {
        await base44.entities.Player.update(player.id, {
          queue_position: position++,
          team: 'winners_court'
        });
      }

      // New challenger (6-11)
      for (const player of newChallenger) {
        await base44.entities.Player.update(player.id, {
          queue_position: position++,
          team: 'challenger'
        });
      }

      // Remaining queue
      for (const player of remainingQueue) {
        await base44.entities.Player.update(player.id, {
          queue_position: position++,
          team: 'queue'
        });
      }

      toast.success(`Winner's Court defends! ${newStreak} win streak!`);
    } else {
      // Winners court lost
      const newWinnersCourt = players.filter((p: any) => p.team === 'challenger');
      const queue = players.filter((p: any) => p.team === 'queue');

      const newQueuePool = [...queue, ...eliminatedOrder];
      const newChallenger = newQueuePool.slice(0, 6);
      const remainingQueue = newQueuePool.slice(6);

      let position = 0;

      // Challenger becomes winners court (0-5)
      for (const player of newWinnersCourt) {
        await base44.entities.Player.update(player.id, {
          queue_position: position++,
          team: 'winners_court'
        });
      }

      // New challenger (6-11)
      for (const player of newChallenger) {
        await base44.entities.Player.update(player.id, {
          queue_position: position++,
          team: 'challenger'
        });
      }

      // Remaining queue
      for (const player of remainingQueue) {
        await base44.entities.Player.update(player.id, {
          queue_position: position++,
          team: 'queue'
        });
      }

      toast.success('Challenger takes the court!');
    }

    queryClient.invalidateQueries({ queryKey: ['players'] });
    setTrackingElimination(null);
  };

  const handleMoveUp = async (player: any) => {
    const q = players.filter((p: any) => p.team === 'queue');
    const index = q.findIndex((p: any) => p.id === player.id);
    if (index === 0) return;

    const swapPlayer = q[index - 1];
    await Promise.all([
      base44.entities.Player.update(player.id, { queue_position: swapPlayer.queue_position }),
      base44.entities.Player.update(swapPlayer.id, { queue_position: player.queue_position })
    ]);

    queryClient.invalidateQueries({ queryKey: ['players'] });
  };

  const handleMoveDown = async (player: any) => {
    const q = players.filter((p: any) => p.team === 'queue');
    const index = q.findIndex((p: any) => p.id === player.id);
    if (index === q.length - 1) return;

    const swapPlayer = q[index + 1];
    await Promise.all([
      base44.entities.Player.update(player.id, { queue_position: swapPlayer.queue_position }),
      base44.entities.Player.update(swapPlayer.id, { queue_position: player.queue_position })
    ]);

    queryClient.invalidateQueries({ queryKey: ['players'] });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center shadow-lg">
              <Gamepad2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Team of The Week</h1>
              <p className="text-slate-500 text-sm">Winner's Court vs Challenger</p>
            </div>
          </div>

          <div className="flex gap-2">
            {players.length > 0 && (
              <Button
                onClick={handleRandomizeClick}
                variant="outline"
                aria-disabled={!canRandomizeTeams}
                className={[
                  "border-indigo-300 text-indigo-600",
                  canRandomizeTeams ? "hover:bg-indigo-50" : "opacity-50 cursor-not-allowed hover:bg-transparent",
                ].join(" ")}
              >
                <Shuffle className="h-4 w-4 mr-2" />
                {randomizeTeamsMutation.isPending ? "Randomizing..." : "Randomize Teams"}
              </Button>
            )}

            {players.length > 0 && (
              <Button
                onClick={() => setShowResetDialog(true)}
                variant="outline"
                className="border-rose-300 text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Reset All
              </Button>
            )}

            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-slate-800 hover:bg-slate-900 shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Player
            </Button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 space-y-6">
            {trackingElimination ? (
              <EliminationTracker
                losingTeamPlayers={trackingElimination.players}
                onComplete={handleEliminationComplete}
                onCancel={() => setTrackingElimination(null)}
              />
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  <TeamCard
                    team="winners_court"
                    players={winnersCourtPlayers}
                    streak={winnersCourtStreak}
                  />
                  <TeamCard
                    team="challenger"
                    players={challengerPlayers}
                  />
                </div>

                <GameControls
                  winnersCourtCount={winnersCourtPlayers.length}
                  challengerCount={challengerPlayers.length}
                  onWinnersCourtWins={handleWinnersCourtWins}
                  onChallengerWins={handleChallengerWins}
                  isLoading={false}
                />
              </>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6">
            <CountdownTimer />
            <StreakRecord
              longestStreak={longestStreak}
              longestStreakPlayers={longestStreakPlayers}
            />
            <QueuePanel
              players={queuePlayers}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onDelete={setPlayerToDelete}
            />
          </div>
        </div>
      </div>

      <AddPlayerModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreate={createPlayerMutation.mutateAsync}
        existingCount={players.length}
        winnersCourtCount={winnersCourtPlayers.length}
        challengerCount={challengerPlayers.length}
      />

      <AlertDialog open={!!playerToDelete} onOpenChange={() => setPlayerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Player</AlertDialogTitle>
            <AlertDialogDescription>
              Remove "{playerToDelete?.name}" from the system? This will reorder all players.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePlayerMutation.mutate(playerToDelete?.id)}
              className="
                inline-flex items-center justify-center gap-2 whitespace-nowrap
                rounded-md text-sm font-medium transition-colors
                focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
                disabled:pointer-events-none disabled:opacity-50
                [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0
                text-primary-foreground shadow
                h-9 px-4 py-2
                bg-rose-500 hover:bg-rose-600
              "
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-rose-600">
              <Trash2 className="h-5 w-5" />
              Reset Everything
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {players.length} players and {games.length} game records.
              This action cannot be undone. Use this at the start of a new week.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => resetAllMutation.mutate()}
              disabled={resetAllMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {resetAllMutation.isPending ? 'Resetting...' : 'Reset Everything'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
