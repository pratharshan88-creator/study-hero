import React, { useState } from 'react';
import { Task } from '../types';
import { validatePin } from '../services/storageService';
import { Lock, Check, X } from 'lucide-react';

interface Props {
  task: Task;
  onApprove: () => void;
  onReject: () => void;
}

const ParentApproval: React.FC<Props> = ({ task, onApprove, onReject }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleNumberClick = (num: number) => {
    if (pin.length < 4) setPin(prev => prev + num);
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const handleSubmit = () => {
    if (validatePin(pin)) {
      onApprove();
    } else {
      setError('Incorrect PIN');
      setPin('');
    }
  };

  const elapsedMin = Math.floor((task.actualTime || 0) / 60);

  // Calculate points preview
  let pointsPreview = 0;
  if(task.status === 'failed') pointsPreview = -5;
  else if (task.actualTime && task.actualTime <= task.estimatedTime * 60) pointsPreview = 10;
  else pointsPreview = 5;


  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6 animate-fade-in max-w-md mx-auto">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full border border-slate-100">
        <div className="flex items-center justify-center mb-4">
            <div className="bg-brand-100 p-3 rounded-full">
                <Lock className="w-8 h-8 text-brand-600" />
            </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-1">Parent Approval</h2>
        <p className="text-center text-slate-500 text-sm mb-6">Enter PIN to approve marks</p>

        <div className="bg-slate-50 p-4 rounded-xl space-y-2 mb-6 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Subject</span>
            <span className="font-semibold text-slate-700">{task.subjectName}</span>
          </div>
           <div className="flex justify-between">
            <span className="text-slate-500">Est. Time</span>
            <span className="font-semibold text-slate-700">{task.estimatedTime} min</span>
          </div>
           <div className="flex justify-between">
            <span className="text-slate-500">Actual Time</span>
            <span className={`font-semibold ${task.actualTime && task.actualTime > task.estimatedTime * 60 ? 'text-red-500' : 'text-green-600'}`}>
                {elapsedMin} min
            </span>
          </div>
           <div className="flex justify-between pt-2 border-t border-slate-200 mt-2">
            <span className="font-bold text-slate-800">Score</span>
            <span className={`font-bold ${pointsPreview >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {pointsPreview > 0 ? '+' : ''}{pointsPreview}
            </span>
          </div>
        </div>

        {/* PIN Display */}
        <div className="flex justify-center gap-4 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 ${
                i < pin.length ? 'bg-brand-600 border-brand-600' : 'bg-transparent border-slate-300'
              }`}
            />
          ))}
        </div>
        
        {error && <p className="text-red-500 text-center mb-4 font-medium animate-bounce">{error}</p>}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              className="h-14 rounded-full bg-slate-100 text-xl font-bold text-slate-700 active:bg-slate-200 transition"
            >
              {num}
            </button>
          ))}
          <button onClick={handleClear} className="h-14 rounded-full text-slate-500 font-medium active:bg-slate-100">C</button>
          <button onClick={() => handleNumberClick(0)} className="h-14 rounded-full bg-slate-100 text-xl font-bold text-slate-700 active:bg-slate-200">0</button>
           <button onClick={handleSubmit} className="h-14 rounded-full bg-brand-600 text-white flex items-center justify-center active:bg-brand-700">
             <Check className="w-6 h-6" />
           </button>
        </div>

        <button onClick={onReject} className="w-full py-3 text-slate-400 font-medium hover:text-slate-600">
            Cancel Approval
        </button>
      </div>
    </div>
  );
};

export default ParentApproval;
