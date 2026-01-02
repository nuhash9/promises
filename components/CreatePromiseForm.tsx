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
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-amber-100 p-6">
      <h2 className="text-xl font-serif font-bold text-gray-900 mb-4">Make a Promise</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* User Search */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
            className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
          />
          
          {showResults && searchTerm && filteredUsers.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
              {filteredUsers.map(user => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleUserSelect(user.id, user.username)}
                  className="w-full px-4 py-2 text-left hover:bg-amber-50 flex justify-between items-center"
                >
                  <span className="font-medium">@{user.username}</span>
                  <span className="text-sm text-gray-500">✨ {user.vows} vows</span>
                </button>
              ))}
            </div>
          )}

          {showResults && searchTerm && filteredUsers.length === 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-gray-500 text-sm">
              No users found
            </div>
          )}

          {selectedUserObj && (
            <p className="mt-1 text-sm text-green-600">
              ✓ Selected: @{selectedUserObj.username}
            </p>
          )}
        </div>

        {/* Promise Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            I promise that...
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What are you promising?"
            rows={3}
            className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent resize-none"
          />
        </div>

        {/* Stake */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stake (vows)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max={Math.min(currentUser.vows, 50)}
              value={stake}
              onChange={(e) => setStake(Number(e.target.value))}
              className="flex-1 h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer"
            />
            <input
              type="number"
              min="1"
              max={currentUser.vows}
              value={stake}
              onChange={(e) => setStake(Math.max(1, Math.min(currentUser.vows, Number(e.target.value))))}
              className="w-20 px-3 py-1 border border-amber-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Both you and @{selectedUserObj?.username || '...'} will stake {stake} vows each
          </p>
        </div>

        {/* Outcome Explanation */}
        <div className="bg-amber-50 rounded-lg p-4 text-sm">
          <p className="font-medium text-amber-800 mb-2">How it works:</p>
          <ul className="space-y-1 text-amber-700">
            <li>✅ <strong>Promise kept:</strong> Both get stake back + 50% bonus ({stake + Math.floor(stake * 0.5)} vows each)</li>
            <li>💔 <strong>Promise broken:</strong> Promisee gets entire pot ({stake * 2} vows)</li>
          </ul>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending || currentUser.vows < stake}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Creating...' : `Create Promise (stake ${stake} vows)`}
        </button>
      </div>
    </form>
  );
}
