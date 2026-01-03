import Link from 'next/link';
import { getCurrentUser, fetchUsers, fetchUserPromises } from '@/lib/actions';
import CreatePromiseForm from '@/components/CreatePromiseForm';
import PromiseList from '@/components/PromiseList';

export default async function Home() {
  const user = await getCurrentUser();
  const users = await fetchUsers();

  if (!user) {
    return (
      <div className="text-center py-20">
        <h1 className="text-6xl font-serif font-bold text-stone-900 mb-6 tracking-tight">
          Promises
        </h1>
        <p className="text-xl text-stone-600 mb-10 max-w-lg mx-auto font-light leading-relaxed">
          The currency of trust. Stake vows on your word.
        </p>
        
        <Link
          href="/auth"
          className="inline-block bg-amber-600 text-white px-10 py-4 font-semibold uppercase tracking-widest hover:bg-amber-700 transition"
        >
          Get Started
        </Link>

        <div className="mt-20 grid md:grid-cols-3 gap-px bg-stone-200 border border-stone-200">
          <div className="bg-white p-10 text-center hover:bg-stone-50 transition">
            <h3 className="font-serif font-bold text-stone-900 text-xl mb-3">Make Promises</h3>
            <p className="text-stone-500 text-sm leading-relaxed">
              Define your commitment. Stake your reputation.
            </p>
          </div>
          <div className="bg-white p-10 text-center hover:bg-stone-50 transition">
            <h3 className="font-serif font-bold text-stone-900 text-xl mb-3">Stake Vows</h3>
            <p className="text-stone-500 text-sm leading-relaxed">
              Put skin in the game. Mutual stakes ensure mutual respect.
            </p>
          </div>
          <div className="bg-white p-10 text-center hover:bg-stone-50 transition">
            <h3 className="font-serif font-bold text-stone-900 text-xl mb-3">Build Trust</h3>
            <p className="text-stone-500 text-sm leading-relaxed">
              A transparent record of your integrity.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const promises = await fetchUserPromises(user.id);

  // Categorize promises
  const incoming = promises
    .filter(p => p.promiseeId === user.id && p.status === 'pending')
    .sort((a, b) => b.createdAt - a.createdAt);

  const outgoing = promises
    .filter(p => p.promiserId === user.id && p.status === 'pending')
    .sort((a, b) => b.createdAt - a.createdAt);

  const active = promises
    .filter(p => p.status === 'accepted')
    .sort((a, b) => b.createdAt - a.createdAt);

  const history = promises
    .filter(p => ['kept', 'broken', 'declined'].includes(p.status))
    .sort((a, b) => (b.resolvedAt || 0) - (a.resolvedAt || 0));

  // Calculate stats
  const myPromisesMade = promises.filter(p => p.promiserId === user.id);
  const kept = myPromisesMade.filter(p => p.status === 'kept').length;
  const broken = myPromisesMade.filter(p => p.status === 'broken').length;
  const total = kept + broken;
  const trustScore = total > 0 ? Math.round((kept / total) * 100) : 100;

  return (
    <>
      {/* Stats Bar */}
      <div className="grid grid-cols-4 border border-stone-200 bg-stone-200 gap-px mb-12">
        <div className="bg-white p-6 text-center">
          <p className="text-3xl font-serif font-bold text-amber-600">{user.vows}</p>
          <p className="text-xs text-stone-500 uppercase tracking-widest mt-1">Vows</p>
        </div>
        <div className="bg-white p-6 text-center">
          <p className="text-3xl font-serif font-bold text-amber-600">{kept}</p>
          <p className="text-xs text-stone-500 uppercase tracking-widest mt-1">Kept</p>
        </div>
        <div className="bg-white p-6 text-center">
          <p className="text-3xl font-serif font-bold text-amber-600">{broken}</p>
          <p className="text-xs text-stone-500 uppercase tracking-widest mt-1">Broken</p>
        </div>
        <div className="bg-white p-6 text-center">
          <p className="text-3xl font-serif font-bold text-amber-600">{trustScore}%</p>
          <p className="text-xs text-stone-500 uppercase tracking-widest mt-1">Trust Score</p>
        </div>
      </div>

      {/* Create Promise Form */}
      <div className="mb-12">
        <CreatePromiseForm users={users} currentUser={user} />
      </div>

      {/* Incoming Promises (Need Action) */}
      {incoming.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-2 w-2 rounded-full bg-amber-600"></span>
            <h2 className="text-xl font-serif font-bold text-stone-900">Needs Response</h2>
          </div>
          <PromiseList
            promises={incoming}
            users={users}
            currentUserId={user.id}
            title=""
            emptyMessage=""
          />
        </div>
      )}

      {/* Outgoing Pending */}
      {outgoing.length > 0 && (
        <div className="mb-12">
          <PromiseList
            promises={outgoing}
            users={users}
            currentUserId={user.id}
            title="Awaiting Response"
            emptyMessage=""
          />
        </div>
      )}

      {/* Active Promises */}
      <div className="mb-12">
        <PromiseList
          promises={active}
          users={users}
          currentUserId={user.id}
          title="Active Promises"
          emptyMessage="No active promises."
        />
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="mt-16 pt-10 border-t border-stone-200">
          <PromiseList
            promises={history}
            users={users}
            currentUserId={user.id}
            title="History"
            emptyMessage=""
          />
        </div>
      )}
    </>
  );
}
