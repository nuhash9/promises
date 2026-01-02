import Link from 'next/link';
import { getCurrentUser, fetchUsers, fetchUserPromises } from '@/lib/actions';
import CreatePromiseForm from '@/components/CreatePromiseForm';
import PromiseList from '@/components/PromiseList';

export default async function Home() {
  const user = await getCurrentUser();
  const users = await fetchUsers();

  if (!user) {
    return (
      <div className="text-center py-16">
        <h1 className="text-5xl font-serif font-bold text-gray-900 mb-4">
          Promises
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
          Make promises that matter. Stake your vows, build trust, and keep your word.
        </p>
        
        <Link
          href="/auth"
          className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-4 rounded-xl font-medium text-lg hover:from-amber-600 hover:to-orange-600 transition shadow-lg"
        >
          Get Started
        </Link>

        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-amber-100">
            <div className="text-3xl mb-3">🤝</div>
            <h3 className="font-bold text-gray-900 mb-2">Make Promises</h3>
            <p className="text-gray-600 text-sm">
              Promise something to another user and stake vows to show you mean it.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-amber-100">
            <div className="text-3xl mb-3">✨</div>
            <h3 className="font-bold text-gray-900 mb-2">Stake Vows</h3>
            <p className="text-gray-600 text-sm">
              Both parties stake vows. Keep promises to earn bonus vows together.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-amber-100">
            <div className="text-3xl mb-3">🏆</div>
            <h3 className="font-bold text-gray-900 mb-2">Build Trust</h3>
            <p className="text-gray-600 text-sm">
              Your track record speaks for itself. Keep promises, grow your reputation.
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
        <div className="bg-white rounded-xl p-4 shadow-sm border border-amber-100 text-center">
          <p className="text-2xl font-bold text-amber-600">✨ {user.vows}</p>
          <p className="text-sm text-gray-500">Vows</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-amber-100 text-center">
          <p className="text-2xl font-bold text-green-600">{kept}</p>
          <p className="text-sm text-gray-500">Kept</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-amber-100 text-center">
          <p className="text-2xl font-bold text-red-600">{broken}</p>
          <p className="text-sm text-gray-500">Broken</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-amber-100 text-center">
          <p className="text-2xl font-bold text-blue-600">{trustScore}%</p>
          <p className="text-sm text-gray-500">Trust Score</p>
        </div>
      </div>

      {/* Create Promise Form */}
      <div className="mb-8">
        <CreatePromiseForm users={users} currentUser={user} />
      </div>

      {/* Incoming Promises (Need Action) */}
      {incoming.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <h2 className="text-xl font-serif font-bold text-gray-900">Needs Your Response</h2>
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
        <div className="mb-8">
          <PromiseList
            promises={outgoing}
            users={users}
            currentUserId={user.id}
            title="⏳ Awaiting Response"
            emptyMessage=""
          />
        </div>
      )}

      {/* Active Promises */}
      <div className="mb-8">
        <PromiseList
          promises={active}
          users={users}
          currentUserId={user.id}
          title="🤝 Active Promises"
          emptyMessage="No active promises right now"
        />
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="mt-12 pt-8 border-t border-amber-200">
          <PromiseList
            promises={history}
            users={users}
            currentUserId={user.id}
            title="📜 History"
            emptyMessage=""
          />
        </div>
      )}
    </>
  );
}
