import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export default function CountdownTimer() {
  const [minutes, setMinutes] = useState(10);
  const [seconds, setSeconds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isEditing, setIsEditing] = useState(true);

  useEffect(() => {
    if (!isRunning || timeLeft === null) return;

    if (timeLeft <= 0) {
      setIsRunning(false);
      toast.error('⏰ Time is up!', {
        duration: 5000,
        style: { fontSize: '16px', fontWeight: 'bold' }
      });
      // Play a sound if possible
      if (typeof Audio !== 'undefined') {
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUKrj779gGwU7k9jyyn0sjSR1xvDdj0AKFF607Oyr');
          audio.play().catch(() => {});
        } catch (e) {}
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const handleStart = () => {
    if (isEditing) {
      const totalSeconds = minutes * 60 + seconds;
      if (totalSeconds <= 0) {
        toast.error('Please enter a valid time');
        return;
      }
      setTimeLeft(totalSeconds);
      setIsEditing(false);
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(null);
    setIsEditing(true);
  };

  const displayMinutes = timeLeft !== null ? Math.floor(timeLeft / 60) : minutes;
  const displaySeconds = timeLeft !== null ? timeLeft % 60 : seconds;

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-indigo-800">
          <Timer className="h-5 w-5" />
          Game Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs text-slate-600 mb-1 block">Minutes</label>
              <Input
                type="number"
                min="0"
                max="99"
                value={minutes}
                onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                className="text-center text-2xl font-bold h-16"
              />
            </div>
            <div className="text-3xl font-bold text-slate-400 pt-6">:</div>
            <div className="flex-1">
              <label className="text-xs text-slate-600 mb-1 block">Seconds</label>
              <Input
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                className="text-center text-2xl font-bold h-16"
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className={`text-6xl font-bold ${timeLeft <= 10 ? 'text-rose-600 animate-pulse' : 'text-indigo-800'}`}>
              {String(displayMinutes).padStart(2, '0')}:{String(displaySeconds).padStart(2, '0')}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {!isRunning && timeLeft === null ? (
            <Button
              onClick={handleStart}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 h-12"
            >
              <Play className="h-5 w-5 mr-2" />
              Start
            </Button>
          ) : (
            <>
              <Button
                onClick={isRunning ? handlePause : handleStart}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 h-12"
              >
                {isRunning ? (
                  <>
                    <Pause className="h-5 w-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Resume
                  </>
                )}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="h-12 border-slate-300"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}