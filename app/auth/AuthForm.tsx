'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { login, register } from '@/lib/actions';

interface AuthFormProps {
  existingUsers: User[];
}

export default function AuthForm({ existingUsers }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    startTransition(async () => {
      const result = isLogin 
        ? await login(username)
        : await register(username);
      
      if (result.success) {
        router.push('/');
        router.refresh();
      } else {
        setError(result.error || 'An error occurred');
      }
    });
  };

  const handleQuickLogin = (user: User) => {
    startTransition(async () => {
      const result = await login(user.username);
      if (result.success) {
        router.push('/');
        router.refresh();
      }
    });
  };

  return (
    <div className="bg-white border border-stone-200 p-10 max-w-md w-full mx-auto">
      <h1 className="text-3xl font-serif font-bold text-center text-stone-900 mb-2">
        {isLogin ? 'Welcome Back' : 'Join Promises'}
      </h1>
      <p className="text-center text-stone-500 mb-8 font-light">
        {isLogin 
          ? 'Sign in to manage your promises' 
          : 'Start with 100 vows to stake on promises'}
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
            placeholder="Enter username"
            disabled={isPending}
            className="w-full px-4 py-3 border border-stone-200 focus:outline-none focus:border-stone-500 bg-stone-50 transition disabled:opacity-50"
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-stone-900 text-white py-4 font-semibold uppercase tracking-wider hover:bg-stone-800 transition disabled:opacity-50"
        >
          {isPending ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
        </button>
      </form>

      <div className="mt-8 text-center">
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          className="text-stone-500 hover:text-stone-800 text-sm border-b border-transparent hover:border-stone-400 transition pb-0.5"
        >
          {isLogin 
            ? "Don't have an account? Sign up" 
            : 'Already have an account? Sign in'}
        </button>
      </div>

      {/* Demo Users */}
      {isLogin && existingUsers.length > 0 && (
        <div className="mt-10 pt-8 border-t border-stone-100">
          <p className="text-xs text-stone-400 text-center uppercase tracking-wide mb-4">Quick sign in:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {existingUsers.slice(0, 5).map(user => (
              <button
                key={user.id}
                onClick={() => handleQuickLogin(user)}
                disabled={isPending}
                className="px-3 py-1 bg-stone-50 border border-stone-200 text-stone-600 text-xs hover:bg-stone-100 hover:border-stone-300 transition disabled:opacity-50"
              >
                @{user.username}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
