'use client';

import { useState, useTransition } from 'react';
import { User } from '@/types';
import { createPromise } from '@/lib/actions';

interface CreatePromiseFormProps {
  users: User[];
  currentUser: User;
}

export default function CreatePromiseForm({ users, currentUser }: CreatePromiseFormProps) {
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [stake, setStake] = useState(10);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');

  const filteredUsers = users.filter(
    u => 
      u.id !== currentUser.id && 
      u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedUserObj = users.find(u => u.id === selectedUser);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedUser) {
      setError('Please select a user to make a promise to');
      return;
    }

    if (!description.trim()) {
      setError('Please enter what you\'re promising');
      return;
    }

    if (stake < 1) {
      setError('Stake must be at least 1 trust');
      return;
    }

    if (currentUser.trust < stake) {
      setError('You don\'t have enough trust');
      return;
    }

    startTransition(async () => {
      const result = await createPromise(selectedUser, description.trim(), stake);
      
      if (result.success) {
        setSearchTerm('');
        setSelectedUser(null);
        setDescription('');
        setStake(10);
      } else {
        setError(result.error || 'Failed to create promise');
      }
    });
  };

  const handleUserSelect = (userId: string, username: string) => {
    setSelectedUser(userId);
    setSearchTerm(username);
    setShowResults(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-stone-200 p-8">
      <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6">Make a Promise</h2>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* User Search */}
        <div className="relative">
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
            Promise to
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedUser(null);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            placeholder="Search for a user..."
            className="w-full px-4 py-3 border-b-2 border-yellow-200 text-center focus:outline-none focus:border-yellow-400 transition bg-transparent"
          />
          
          {showResults && searchTerm && filteredUsers.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-stone-200 shadow-lg max-h-48 overflow-auto">
              {filteredUsers.map(user => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleUserSelect(user.id, user.username)}
                  className="w-full px-4 py-3 text-left hover:bg-stone-50 flex justify-between items-center border-b border-stone-100 last:border-0"
                >
                  <span className="font-medium">@{user.username}</span>
                  <span className="text-sm text-gray-500">✨ {user.trust} trust</span>
                </button>
              ))}
            </div>
          )}

          {showResults && searchTerm && filteredUsers.length === 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-stone-200 shadow-lg p-4 text-stone-500 text-sm">
              No users found
            </div>
          )}

          {selectedUserObj && (
            <p className="mt-2 text-sm text-stone-600 flex items-center gap-1">
              <span className="text-green-600">✓</span> Selected: @{selectedUserObj.username}
            </p>
          )}
        </div>

        {/* Promise Description */}
        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
            I promise that...
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What are you promising?"
            rows={3}
            className="w-full px-4 py-3 border-b-2 border-yellow-200 text-center focus:outline-none focus:border-yellow-400 transition bg-transparent resize-none font-serif text-lg"
          />
        </div>

        {/* Stake */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stake (trust)
          </label>
          <div className="flex items-center gap-3">
              <input
              type="range"
              min="1"
              max={Math.min(currentUser.trust, 50)}
              value={stake}
              onChange={(e) => setStake(Number(e.target.value))}
              className="flex-1 h-1 bg-stone-200 rounded-none appearance-none cursor-pointer"
            />
            <input
              type="number"
              min="1"
              max={currentUser.trust}
              value={stake}
              onChange={(e) => setStake(Math.max(1, Math.min(currentUser.trust, Number(e.target.value))))}
              className="w-20 px-3 py-1 border border-amber-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            You will stake {stake} trust on this promise
          </p>
        </div>

        {/* Outcome Explanation */}
        <div className="bg-amber-50 rounded-lg p-4 text-sm">
          <p className="font-medium text-amber-800 mb-2">How it works:</p>
          <ul className="space-y-1 text-amber-700">
            <li>✅ <strong>Promise kept:</strong> You get stake back + 50% bonus ({stake + Math.floor(stake * 0.5)} trust), they get {Math.floor(stake * 0.5)} trust</li>
            <li>💔 <strong>Promise broken:</strong> They get your stake ({stake} trust)</li>
          </ul>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending || currentUser.trust < stake}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Creating...' : `Create Promise (stake ${stake} trust)`}
        </button>
      </div>
    </form>
  );
}
