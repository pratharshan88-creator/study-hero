
import React, { useState } from 'react';
import { User } from '../types';
import * as storage from '../services/storageService';
import { User as UserIcon, Lock } from 'lucide-react';

interface SettingsProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser }) => {
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [msg, setMsg] = useState('');

  // Name State
  const [editName, setEditName] = useState(user.name);
  const [nameMsg, setNameMsg] = useState('');

  const handleChangePin = () => {
    if (storage.validatePin(oldPin)) {
      const updatedUser = storage.updateUser({ pin: newPin });
      onUpdateUser(updatedUser);
      setMsg('PIN Updated Successfully');
      setOldPin('');
      setNewPin('');
    } else {
      setMsg('Old PIN Incorrect');
    }
  };

  const handleSaveName = () => {
    if (editName.trim()) {
      const updatedUser = storage.updateUser({ name: editName.trim() });
      onUpdateUser(updatedUser);
      setNameMsg('Name Updated Successfully!');
      setTimeout(() => setNameMsg(''), 3000);
    }
  };

  return (
    <div className="pb-24 space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 px-2">Settings</h2>

      {/* Student Profile Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-slate-400" />
          Student Profile
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Student Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-brand-200"
              placeholder="Enter Name"
            />
          </div>
          {nameMsg && <p className="text-sm font-bold text-green-500">{nameMsg}</p>}

          <button
            onClick={handleSaveName}
            className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition"
          >
            Save Name
          </button>
        </div>
      </div>

      {/* PIN Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-slate-400" />
          Parent PIN
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Current PIN</label>
            <input
              type="password"
              maxLength={4}
              value={oldPin}
              onChange={(e) => setOldPin(e.target.value)}
              className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-brand-200"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">New PIN</label>
            <input
              type="password"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-brand-200"
            />
          </div>
          {msg && (
            <p
              className={`text-sm font-bold ${
                msg.includes('Success') ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {msg}
            </p>
          )}

          <button
            onClick={handleChangePin}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold"
          >
            Update PIN
          </button>
          <p className="text-xs text-center text-slate-400 mt-2">Default PIN is 0001</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
