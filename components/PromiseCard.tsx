'use client';

import { useTransition } from 'react';
import { Promise, User } from '@/types';
import { acceptPromise, declinePromise, resolvePromise } from '@/lib/actions';

interface PromiseCardProps {
  promise: Promise;
  promiser: User | undefined;
  promisee: User | undefined;
  currentUserId: string;
}

export default function PromiseCard({ promise, promiser, promisee, currentUserId }: PromiseCardProps) {
  const [isPending, startTransition] = useTransition();
  
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
  const canResolve = isPromisee && promise.status === 'accepted';

  const handleAccept = () => {
    startTransition(async () => {
      await acceptPromise(promise.id);
    });
  };

  const handleDecline = () => {
    startTransition(async () => {
      await declinePromise(promise.id);
    });
  };

  const handleResolve = (kept: boolean) => {
    startTransition(async () => {
      await resolvePromise(promise.id, kept);
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

      <div className="flex justify-between items-end border-t border-stone-100 pt-4 mt-4">
        <div className="text-sm text-stone-500">
          <span className="font-semibold text-stone-900 block text-lg">{promise.stake}</span>
          <span className="text-xs uppercase tracking-wide">Vows Staked</span>
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

          {promise.status === 'pending' && isPromiser && (
            <span className="text-xs text-stone-400 uppercase tracking-wide py-2">Awaiting response</span>
          )}

          {promise.status === 'accepted' && isPromiser && (
            <span className="text-xs text-stone-500 font-medium uppercase tracking-wide py-2">Fulfill your promise</span>
          )}
        </div>
      </div>

      {promise.status === 'kept' && (
        <div className="mt-4 text-xs text-stone-600 border-t border-stone-100 pt-3">
          Stake returned + 50% bonus awarded to both parties.
        </div>
      )}

      {promise.status === 'broken' && (
        <div className="mt-4 text-xs text-red-600 border-t border-red-50 pt-3">
          {isPromisee ? 'Staked vows transferred to you.' : 'Staked vows forfeited to promisee.'}
        </div>
      )}
    </div>
  );
}
