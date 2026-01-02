'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import {
  getUserByUsername,
  getUserById,
  createUser,
  getUsers,
  getPromisesByUserId,
  createPromise as createPromiseInStore,
  acceptPromise as acceptPromiseInStore,
  declinePromise as declinePromiseInStore,
  resolvePromise as resolvePromiseInStore,
} from './store';

const SESSION_COOKIE = 'promises_session';

// Auth actions
export async function login(username: string): Promise<{ success: boolean; error?: string }> {
  const user = getUserByUsername(username);
  
  if (!user) {
    return { success: false, error: 'User not found. Try signing up instead.' };
  }
  
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
  
  revalidatePath('/');
  return { success: true };
}

export async function register(username: string): Promise<{ success: boolean; error?: string }> {
  if (username.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters' };
  }
  
  const existing = getUserByUsername(username);
  if (existing) {
    return { success: false, error: 'Username already taken. Try signing in.' };
  }
  
  const user = createUser(username);
  
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  });
  
  revalidatePath('/');
  return { success: true };
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  revalidatePath('/');
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  
  if (!sessionId) return null;
  
  return getUserById(sessionId) || null;
}

// Data fetching (can be called from server components)
export async function fetchUsers() {
  return getUsers();
}

export async function fetchUserPromises(userId: string) {
  return getPromisesByUserId(userId);
}

export async function fetchUserById(userId: string) {
  return getUserById(userId);
}

// Promise actions
export async function createPromise(
  promiseeId: string,
  description: string,
  stake: number
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }
  
  if (!description.trim()) {
    return { success: false, error: 'Please enter what you\'re promising' };
  }
  
  if (stake < 1) {
    return { success: false, error: 'Stake must be at least 1 vow' };
  }
  
  if (user.vows < stake) {
    return { success: false, error: 'You don\'t have enough vows' };
  }
  
  createPromiseInStore(user.id, promiseeId, description.trim(), stake);
  
  revalidatePath('/');
  return { success: true };
}

export async function acceptPromise(promiseId: string): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }
  
  const result = acceptPromiseInStore(promiseId, user.id);
  
  if (!result) {
    return { success: false, error: 'Cannot accept this promise' };
  }
  
  revalidatePath('/');
  return { success: true };
}

export async function declinePromise(promiseId: string): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }
  
  const result = declinePromiseInStore(promiseId, user.id);
  
  if (!result) {
    return { success: false, error: 'Cannot decline this promise' };
  }
  
  revalidatePath('/');
  return { success: true };
}

export async function resolvePromise(
  promiseId: string,
  kept: boolean
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }
  
  const result = resolvePromiseInStore(promiseId, user.id, kept);
  
  if (!result) {
    return { success: false, error: 'Cannot resolve this promise' };
  }
  
  revalidatePath('/');
  return { success: true };
}
