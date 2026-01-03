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
    <div className="bg-white rounded-xl shadow-lg border border-amber-100 p-8">
      <h1 className="text-3xl font-serif font-bold text-center text-gray-900 mb-2">
        {isLogin ? 'Welcome Back' : 'Join Promises'}
      </h1>
      <p className="text-center text-gray-500 mb-6">
        {isLogin 
          ? 'Sign in to manage your promises' 
          : 'Start with 100 trust to stake on promises'}
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
            placeholder="Enter username"
            disabled={isPending}
            className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent disabled:opacity-50"
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 transition disabled:opacity-50"
        >
          {isPending ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          className="text-amber-600 hover:text-amber-700 text-sm"
        >
          {isLogin 
            ? "Don't have an account? Sign up" 
            : 'Already have an account? Sign in'}
        </button>
      </div>

      {/* Demo Users */}
      {isLogin && existingUsers.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500 text-center mb-3">Quick sign in:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {existingUsers.slice(0, 5).map(user => (
              <button
                key={user.id}
                onClick={() => handleQuickLogin(user)}
                disabled={isPending}
                className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm hover:bg-amber-100 transition disabled:opacity-50"
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
