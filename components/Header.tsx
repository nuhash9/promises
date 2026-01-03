import Link from 'next/link';
import { getCurrentUser } from '@/lib/actions';
import LogoutButton from './LogoutButton';

export default async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-amber-200 sticky top-0 z-50">
      <div className="max-w-screen-md mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-serif font-bold text-amber-900 hover:text-amber-700 transition">
          Promises
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">@{user.username}</p>
              <p className="text-sm font-semibold text-amber-700">
                ✨ {user.trust} trust
              </p>
            </div>
            <LogoutButton />
          </div>
        ) : (
          <Link
            href="/auth"
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition text-sm font-medium"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
