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
    pending: 'bg-stone-100 text-stone-600 border-stone-200',
    accepted: 'bg-stone-800 text-white border-stone-800',
    kept: 'bg-white text-stone-800 border-stone-800',
    broken: 'bg-red-50 text-red-900 border-red-200',
    declined: 'bg-stone-50 text-stone-400 border-stone-200 decoration-line-through',
  };

  const statusLabels = {
    pending: 'Pending',
    accepted: 'In Progress',
    kept: 'Kept',
    broken: 'Broken',
    declined: 'Declined',
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
    <div className="bg-white border border-stone-200 p-6 transition-all duration-200 group hover:border-stone-400">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-stone-500 uppercase tracking-wider">
            <span className="text-stone-900">@{promiser?.username}</span>
            <span className="text-stone-300 mx-2">&rarr;</span>
            <span className="text-stone-900">@{promisee?.username}</span>
          </p>
        </div>
        <span className={`text-xs px-2 py-1 border ${statusColors[promise.status]} font-medium uppercase tracking-wide`}>
          {statusLabels[promise.status]}
        </span>
      </div>

      <p className="text-stone-900 mb-6 text-xl font-serif leading-relaxed">
        {promise.description}
      </p>

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-sm text-stone-500">
          <span className="font-medium text-stone-700">{promise.stake} trust</span> at stake
        </div>

        <div className="flex gap-3">
          {canAccept && (
            <button
              onClick={handleAccept}
              disabled={isPending}
              className="bg-green-100 border border-green-200 text-green-900 px-4 py-2 text-xs uppercase tracking-wider font-semibold hover:bg-green-200 transition disabled:opacity-50"
            >
              Accept
            </button>
          )}
          
          {canDecline && (
            <button
              onClick={handleDecline}
              disabled={isPending}
              className="bg-white border border-stone-300 text-stone-600 px-4 py-2 text-xs uppercase tracking-wider font-semibold hover:bg-stone-50 transition disabled:opacity-50"
            >
              Decline
            </button>
          )}

          {canResolve && (
            <>
              <button
                onClick={() => handleResolve(true)}
                disabled={isPending}
                className="bg-green-100 border border-green-200 text-green-900 px-4 py-2 text-xs uppercase tracking-wider font-semibold hover:bg-green-200 transition disabled:opacity-50"
              >
                Mark Kept
              </button>
              <button
                onClick={() => handleResolve(false)}
                disabled={isPending}
                className="bg-white border border-red-200 text-red-700 px-4 py-2 text-xs uppercase tracking-wider font-semibold hover:bg-red-50 transition disabled:opacity-50"
              >
                Mark Broken
              </button>
            </>
          )}

          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="bg-white border border-stone-300 text-stone-600 px-4 py-2 text-xs uppercase tracking-wider font-semibold hover:bg-stone-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
          )}

          {promise.status === 'accepted' && isPromiser && (
            <span className="text-xs text-stone-500 font-medium uppercase tracking-wide py-2">Fulfill your promise</span>
          )}
        </div>
      </div>

      {promise.status === 'kept' && (
        <div className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 p-2">
          {isPromiser ? 'You got your stake back + 50% bonus!' : 'You earned a 50% bonus for their kept promise!'}
        </div>
      )}

      {promise.status === 'broken' && (
        <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 p-2">
          {isPromisee ? 'You received their stake.' : 'They received your stake.'}
        </div>
      )}
    </div>
  );
}
