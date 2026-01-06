import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Users } from 'lucide-react';

const avatarColors = [
  'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-sky-500', 
  'bg-violet-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
];

export default function CreateTeamModal({ open, onClose, onCreate }) {
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState([{ name: '', avatar_color: avatarColors[0] }]);
  const [isLoading, setIsLoading] = useState(false);

  const addMember = () => {
    setMembers([...members, { name: '', avatar_color: avatarColors[members.length % avatarColors.length] }]);
  };

  const removeMember = (index) => {
    if (members.length > 1) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  const updateMember = (index, name) => {
    const updated = [...members];
    updated[index].name = name;
    setMembers(updated);
  };

  const handleSubmit = async () => {
    if (!teamName.trim() || members.some(m => !m.name.trim())) return;
    
    setIsLoading(true);
    await onCreate({
      name: teamName,
      members: members.filter(m => m.name.trim()),
      current_player_index: 0,
      current_streak: 0,
      highest_streak: 0,
      total_wins: 0,
      total_losses: 0
    });
    setIsLoading(false);
    setTeamName('');
    setMembers([{ name: '', avatar_color: avatarColors[0] }]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Create New Team
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="teamName">Team Name</Label>
            <Input
              id="teamName"
              placeholder="Enter team name..."
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="h-12"
            />
          </div>

          <div className="space-y-3">
            <Label>Team Members</Label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {members.map((member, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className={`h-10 w-10 rounded-xl ${member.avatar_color} flex items-center justify-center text-white font-bold shrink-0`}>
                    {member.name?.charAt(0)?.toUpperCase() || (index + 1)}
                  </div>
                  <Input
                    placeholder={`Player ${index + 1} name...`}
                    value={member.name}
                    onChange={(e) => updateMember(index, e.target.value)}
                    className="h-10"
                  />
                  {members.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 shrink-0 text-slate-400 hover:text-rose-500"
                      onClick={() => removeMember(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            <Button
              variant="outline"
              className="w-full h-10 border-dashed"
              onClick={addMember}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading || !teamName.trim() || members.every(m => !m.name.trim())}
            className="bg-slate-800 hover:bg-slate-900"
          >
            Create Team
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}