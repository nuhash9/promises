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
        <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
          Make promises that matter. Stake your trust, keep your word.
        </p>
        
        <Link
          href="/auth"
          className="inline-block bg-green-100 border border-green-200 text-green-900 px-10 py-4 font-semibold uppercase tracking-widest hover:bg-green-200 transition"
        >
          Get Started
        </Link>

        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 border border-stone-200">
            <h3 className="font-bold text-stone-900 mb-2">Make Promises</h3>
            <p className="text-stone-600 text-sm">
              Promise something to another user and stake trust to show you mean it.
            </p>
          </div>
          <div className="bg-white p-6 border border-stone-200">
            <h3 className="font-bold text-stone-900 mb-2">Stake Trust</h3>
            <p className="text-stone-600 text-sm">
              Put your trust on the line. Keep promises to earn bonus trust together.
            </p>
          </div>
          <div className="bg-white p-6 border border-stone-200">
            <h3 className="font-bold text-stone-900 mb-2">Build Trust</h3>
            <p className="text-stone-600 text-sm">
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
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 text-center border border-stone-200">
          <p className="text-3xl font-serif font-bold text-green-800">{user.trust}</p>
          <p className="text-xs text-stone-500 uppercase tracking-widest mt-1">Trust</p>
        </div>
        <div className="bg-white p-6 text-center border border-stone-200">
          <p className="text-3xl font-serif font-bold text-green-800">{kept}</p>
          <p className="text-xs text-stone-500 uppercase tracking-widest mt-1">Kept</p>
        </div>
        <div className="bg-white p-6 text-center border border-stone-200">
          <p className="text-3xl font-serif font-bold text-green-800">{broken}</p>
          <p className="text-xs text-stone-500 uppercase tracking-widest mt-1">Broken</p>
        </div>
        <div className="bg-white p-6 text-center border border-stone-200">
          <p className="text-3xl font-serif font-bold text-green-800">{trustScore}%</p>
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
            <span className="h-2 w-2 rounded-full bg-green-600"></span>
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
