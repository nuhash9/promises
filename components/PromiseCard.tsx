'use client';

import { useState, useTransition } from 'react';
import { Promise, User } from '@/types';
import { acceptPromise, declinePromise, cancelPromise, resolvePromise } from '@/lib/actions';

interface PromiseCardProps {
  promise: Promise;
  promiser: User | undefined;
  promisee: User | undefined;
  currentUserId: string;
}

export default function PromiseCard({ promise, promiser, promisee, currentUserId }: PromiseCardProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  
  const isPromiser = currentUserId === promise.promiserId;
  const isPromisee = currentUserId === promise.promiseeId;

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    accepted: 'bg-blue-100 text-blue-800 border-blue-300',
    kept: 'bg-green-100 text-green-800 border-green-300',
    broken: 'bg-red-100 text-red-800 border-red-300',
    declined: 'bg-gray-100 text-gray-800 border-gray-300',
  };

  const statusLabels = {
    pending: '⏳ Awaiting Response',
    accepted: '🤝 In Progress',
    kept: '✅ Kept',
    broken: '💔 Broken',
    declined: '❌ Declined',
  };

  const canAccept = isPromisee && promise.status === 'pending';
  const canDecline = isPromisee && promise.status === 'pending';
  const canCancel = isPromiser && promise.status === 'pending';
  const canResolve = isPromisee && promise.status === 'accepted';

  const handleAccept = () => {
    setError('');
    startTransition(async () => {
      const result = await acceptPromise(promise.id);
      if (!result.success) {
        setError(result.error || 'Failed to accept promise');
      }
    });
  };

  const handleDecline = () => {
    setError('');
    startTransition(async () => {
      const result = await declinePromise(promise.id);
      if (!result.success) {
        setError(result.error || 'Failed to decline promise');
      }
    });
  };

  const handleCancel = () => {
    setError('');
    startTransition(async () => {
      const result = await cancelPromise(promise.id);
      if (!result.success) {
        setError(result.error || 'Failed to cancel promise');
      }
    });
  };

  const handleResolve = (kept: boolean) => {
    setError('');
    startTransition(async () => {
      const result = await resolvePromise(promise.id, kept);
      if (!result.success) {
        setError(result.error || 'Failed to resolve promise');
      }
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-5 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <p className="text-lg font-medium text-gray-900">
            <span className="text-amber-700">@{promiser?.username}</span>
            <span className="text-gray-400 mx-2">→</span>
            <span className="text-amber-700">@{promisee?.username}</span>
          </p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[promise.status]}`}>
          {statusLabels[promise.status]}
        </span>
      </div>

      <p className="text-gray-700 mb-4 text-lg italic">
        &ldquo;{promise.description}&rdquo;
      </p>

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          <span className="font-medium text-amber-600">✨ {promise.stake} trust</span> at stake
        </div>

        <div className="flex gap-2">
          {canAccept && (
            <button
              onClick={handleAccept}
              disabled={isPending}
              className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-600 transition disabled:opacity-50"
            >
              Accept & Stake
            </button>
          )}
          
          {canDecline && (
            <button
              onClick={handleDecline}
              disabled={isPending}
              className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-300 transition disabled:opacity-50"
            >
              Decline
            </button>
          )}

          {canResolve && (
            <>
              <button
                onClick={() => handleResolve(true)}
                disabled={isPending}
                className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-600 transition disabled:opacity-50"
              >
                ✅ Promise Kept
              </button>
              <button
                onClick={() => handleResolve(false)}
                disabled={isPending}
                className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-600 transition disabled:opacity-50"
              >
                💔 Broken
              </button>
            </>
          )}

          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-300 transition disabled:opacity-50"
            >
              Cancel
            </button>
          )}

          {promise.status === 'accepted' && isPromiser && (
            <span className="text-sm text-blue-500 italic">Keep your promise!</span>
          )}
        </div>
      </div>

      {promise.status === 'kept' && (
        <div className="mt-3 text-sm text-green-600 bg-green-50 rounded-lg p-2">
          🎉 {isPromiser ? 'You got your stake back + 50% bonus!' : 'You earned a 50% bonus for their kept promise!'}
        </div>
      )}

      {promise.status === 'broken' && (
        <div className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg p-2">
          {isPromisee ? '💰 You received their stake!' : '😔 They received your stake.'}
        </div>
      )}
    </div>
  );
}
