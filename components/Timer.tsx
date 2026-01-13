import React, { useState, useEffect, useRef } from 'react';
import { Task } from '../types';
import { Play, Pause, Square, AlertCircle, CheckCircle } from 'lucide-react';

interface TimerProps {
  task: Task;
  onFinish: (actualTimeSeconds: number, isTimeOver: boolean) => void;
  onCancel: () => void;
}

const Timer: React.FC<TimerProps> = ({ task, onFinish, onCancel }) => {
  const estSeconds = task.estimatedTime * 60;
  const [elapsed, setElapsed] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isOverTime, setIsOverTime] = useState(false);
  
  // Ref for audio to avoid re-creation
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setElapsed(prev => {
          const next = prev + 1;
          if (next > estSeconds && !isOverTime) {
             setIsOverTime(true);
             // Play sound
             try {
                if(!audioRef.current) {
                    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                }
                audioRef.current.play();
             } catch(e) { console.error("Audio play failed", e)}
          }
          return next;
        });
      }, 1000);
    } else if (!isActive && elapsed !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, estSeconds, isOverTime]);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const remaining = Math.max(0, estSeconds - elapsed);
  const progress = Math.min(100, (elapsed / estSeconds) * 100);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-800">{task.subjectName}</h2>
        <p className="text-slate-500">Target: {task.estimatedTime} min</p>
      </div>

      {/* Circle Timer Visualization */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-slate-200"
          />
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={2 * Math.PI * 120}
            strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
            className={`transition-all duration-1000 ${isOverTime ? 'text-red-500' : 'text-brand-500'}`}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
             <span className={`text-5xl font-mono font-bold ${isOverTime ? 'text-red-600' : 'text-slate-700'}`}>
            {isOverTime ? formatTime(elapsed) : formatTime(remaining)}
          </span>
          <span className="text-sm font-medium uppercase tracking-wider text-slate-400 mt-2">
            {isOverTime ? 'Overtime' : 'Remaining'}
          </span>
        </div>
      </div>

      {isOverTime && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg flex items-center animate-pulse">
            <AlertCircle className="w-5 h-5 mr-2" />
            Time Over!
        </div>
      )}

      <div className="flex gap-4 w-full max-w-xs">
        {/* If time is over, they can only "Finish" or "Stop (Failed)" */}
        <button
          onClick={() => onFinish(elapsed, isOverTime)}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg transform transition active:scale-95 flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-6 h-6" />
          I Finished
        </button>
      </div>

       <button
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 font-medium"
        >
          Cancel Session
        </button>
    </div>
  );
};

export default Timer;
