import { Promise, User } from '@/types';
import PromiseCard from './PromiseCard';

interface PromiseListProps {
  promises: Promise[];
  users: User[];
  currentUserId: string;
  title: string;
  emptyMessage: string;
}

export default function PromiseList({ promises, users, currentUserId, title, emptyMessage }: PromiseListProps) {
  const getUserById = (id: string) => users.find(u => u.id === id);

  if (promises.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-stone-200 bg-stone-50">
        <p className="text-stone-400 font-serif italic">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      {title && <h2 className="text-xl font-serif font-bold text-stone-900 mb-6 border-b border-stone-200 pb-2">{title}</h2>}
      <div className="space-y-6">
        {promises.map(promise => (
          <PromiseCard
            key={promise.id}
            promise={promise}
            promiser={getUserById(promise.promiserId)}
            promisee={getUserById(promise.promiseeId)}
            currentUserId={currentUserId}
          />
        ))}
      </div>
    </div>
  );
}
