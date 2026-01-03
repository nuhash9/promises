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
      setError('Stake must be at least 1 vow');
      return;
    }

    if (currentUser.vows < stake) {
      setError('You don\'t have enough vows');
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
                  <span className="font-medium text-stone-900">@{user.username}</span>
                  <span className="text-xs text-stone-500 uppercase tracking-wide">{user.vows} vows</span>
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
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
            Stake (vows)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max={Math.min(currentUser.vows, 50)}
              value={stake}
              onChange={(e) => setStake(Number(e.target.value))}
              className="flex-1 h-1 bg-stone-200 rounded-none appearance-none cursor-pointer"
            />
            <input
              type="number"
              min="1"
              max={currentUser.vows}
              value={stake}
              onChange={(e) => setStake(Math.max(1, Math.min(currentUser.vows, Number(e.target.value))))}
              className="w-24 px-3 py-2 border border-stone-200 text-center focus:outline-none focus:border-stone-500 bg-stone-50 font-mono"
            />
          </div>
          <p className="mt-2 text-xs text-stone-500">
            Both you and @{selectedUserObj?.username || '...'} will stake {stake} vows each
          </p>
        </div>

        {/* Outcome Explanation */}
        <div className="bg-stone-50 border border-stone-100 p-5 text-sm">
          <p className="font-semibold text-stone-900 mb-2 uppercase text-xs tracking-wide">Terms</p>
          <ul className="space-y-2 text-stone-600">
            <li className="flex items-start gap-2">
              <span className="text-stone-400">•</span>
              <span><strong>Kept:</strong> Both get stake back + 50% bonus ({stake + Math.floor(stake * 0.5)} vows each)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-stone-400">•</span>
              <span><strong>Broken:</strong> Promisee gets entire pot ({stake * 2} vows)</span>
            </li>
          </ul>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending || currentUser.vows < stake}
          className="w-full bg-green-100 border border-green-200 text-green-900 py-4 font-semibold uppercase tracking-wider hover:bg-green-200 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isPending ? 'Creating...' : `Create Promise (stake ${stake} vows)`}
        </button>
      </div>
    </form>
  );
}
