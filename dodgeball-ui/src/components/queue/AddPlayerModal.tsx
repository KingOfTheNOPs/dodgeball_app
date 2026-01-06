import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Crown, Swords, Clock } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const avatarColors = [
  'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-sky-500', 
  'bg-violet-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
  'bg-orange-500', 'bg-lime-500', 'bg-cyan-500', 'bg-purple-500'
];

export default function AddPlayerModal({ open, onClose, onCreate, existingCount, winnersCourtCount, challengerCount }) {
  const [playerName, setPlayerName] = useState('');
  const [selectedColor, setSelectedColor] = useState(avatarColors[existingCount % avatarColors.length]);
  const [selectedTeam, setSelectedTeam] = useState('queue');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!playerName.trim()) return;
    
    setIsLoading(true);
    await onCreate({
      name: playerName.trim(),
      avatar_color: selectedColor,
      team: selectedTeam
    });
    setIsLoading(false);
    setPlayerName('');
    setSelectedColor(avatarColors[(existingCount + 1) % avatarColors.length]);
    setSelectedTeam('queue');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Player to Queue
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="playerName">Player Name</Label>
            <Input
              id="playerName"
              placeholder="Enter player name..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="h-12"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Avatar Color</Label>
            <div className="grid grid-cols-6 gap-2">
              {avatarColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`h-12 w-12 rounded-xl ${color} transition-all ${
                    selectedColor === color 
                      ? 'ring-4 ring-slate-800 scale-110' 
                      : 'hover:scale-105 opacity-70 hover:opacity-100'
                  }`}
                >
                  {selectedColor === color && (
                    <span className="text-white font-bold text-lg">
                      {playerName.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assign to Team</Label>
            <RadioGroup value={selectedTeam} onValueChange={setSelectedTeam}>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                <RadioGroupItem value="winners_court" id="winners_court" disabled={winnersCourtCount >= 6} />
                <Label htmlFor="winners_court" className="flex items-center gap-2 flex-1 cursor-pointer">
                  <Crown className="h-4 w-4 text-amber-500" />
                  <span>Winner's Court ({winnersCourtCount}/6)</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                <RadioGroupItem value="challenger" id="challenger" disabled={challengerCount >= 6} />
                <Label htmlFor="challenger" className="flex items-center gap-2 flex-1 cursor-pointer">
                  <Swords className="h-4 w-4 text-slate-600" />
                  <span>Challenger ({challengerCount}/6)</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                <RadioGroupItem value="queue" id="queue" />
                <Label htmlFor="queue" className="flex items-center gap-2 flex-1 cursor-pointer">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span>Queue</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading || !playerName.trim()}
            className="bg-slate-800 hover:bg-slate-900"
          >
            Add Player
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}