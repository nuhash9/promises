import Link from 'next/link';
import { getCurrentUser } from '@/lib/actions';
import LogoutButton from './LogoutButton';

export default async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-screen-md mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-serif font-bold text-amber-900 tracking-tight">
          Promises
        </Link>

        {user ? (
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-stone-500 uppercase tracking-wide">@{user.username}</p>
              <p className="text-sm font-medium text-amber-700">
                {user.vows} vows
              </p>
            </div>
            <LogoutButton />
          </div>
        ) : (
          <Link
            href="/auth"
            className="bg-amber-600 text-white px-5 py-2 rounded-sm hover:bg-amber-700 transition text-sm font-medium tracking-wide"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
