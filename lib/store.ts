import { User, Promise, AppState } from '../types';

// In-memory store (replace with database in production)
// This persists across requests during server runtime

const defaultUsers: User[] = [
  { id: '1', username: 'alice', trust: 100, createdAt: Date.now() - 86400000 },
  { id: '2', username: 'bob', trust: 100, createdAt: Date.now() - 86400000 },
  { id: '3', username: 'charlie', trust: 100, createdAt: Date.now() - 86400000 },
];

// Global store that persists in server memory
declare global {
  var __store: AppState | undefined;
}

function getStore(): AppState {
  if (!global.__store) {
    global.__store = {
      users: [...defaultUsers],
      promises: [],
      currentUser: null,
    };
  }
  return global.__store;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

// User operations
export function getUsers(): User[] {
  return getStore().users;
}

export function getUserById(id: string): User | undefined {
  return getStore().users.find(u => u.id === id);
}

export function getUserByUsername(username: string): User | undefined {
  return getStore().users.find(u => u.username.toLowerCase() === username.toLowerCase());
}

export function createUser(username: string): User {
  const store = getStore();
  const newUser: User = {
    id: generateId(),
    username: username.toLowerCase(),
    trust: 100,
    createdAt: Date.now(),
  };
  store.users.push(newUser);
  return newUser;
}

export function updateUserTrust(userId: string, trust: number): void {
  const store = getStore();
  const user = store.users.find(u => u.id === userId);
  if (user) {
    user.trust = trust;
  }
}

// Promise operations
export function getPromises(): Promise[] {
  return getStore().promises;
}

export function getPromiseById(id: string): Promise | undefined {
  return getStore().promises.find(p => p.id === id);
}

export function getPromisesByUserId(userId: string): Promise[] {
  return getStore().promises.filter(
    p => p.promiserId === userId || p.promiseeId === userId
  );
}

export function createPromise(
  promiserId: string,
  promiseeId: string,
  description: string,
  stake: number
): Promise {
  const store = getStore();
  
  // Deduct stake from promiser (asymmetric - only promiser stakes)
  const promiser = store.users.find(u => u.id === promiserId);
  if (promiser) {
    promiser.trust -= stake;
  }
  
  const newPromise: Promise = {
    id: generateId(),
    promiserId,
    promiseeId,
    description,
    stake,
    status: 'pending',
    createdAt: Date.now(),
  };
  
  store.promises.push(newPromise);
  return newPromise;
}

export function acceptPromise(promiseId: string, userId: string): Promise | null {
  const store = getStore();
  const promise = store.promises.find(p => p.id === promiseId);
  
  if (!promise || promise.promiseeId !== userId || promise.status !== 'pending') {
    return null;
  }
  
  // Asymmetric staking: promisee doesn't need to stake anything
  promise.status = 'accepted';
  return promise;
}

export function declinePromise(promiseId: string, userId: string): Promise | null {
  const store = getStore();
  const promise = store.promises.find(p => p.id === promiseId);
  
  if (!promise || promise.promiseeId !== userId || promise.status !== 'pending') {
    return null;
  }
  
  // Refund promiser their stake
  const promiser = store.users.find(u => u.id === promise.promiserId);
  if (promiser) {
    promiser.trust += promise.stake;
  }
  
  promise.status = 'declined';
  promise.resolvedAt = Date.now();
  return promise;
}

export function cancelPromise(promiseId: string, userId: string): Promise | null {
  const store = getStore();
  const promise = store.promises.find(p => p.id === promiseId);
  
  // Only the promiser can cancel, and only if still pending
  if (!promise || promise.promiserId !== userId || promise.status !== 'pending') {
    return null;
  }
  
  // Refund promiser their stake
  const promiser = store.users.find(u => u.id === userId);
  if (promiser) {
    promiser.trust += promise.stake;
  }
  
  promise.status = 'declined'; // Reuse 'declined' status for cancelled
  promise.resolvedAt = Date.now();
  return promise;
}

export function resolvePromise(promiseId: string, userId: string, kept: boolean): Promise | null {
  const store = getStore();
  const promise = store.promises.find(p => p.id === promiseId);
  
  if (!promise || promise.promiseeId !== userId || promise.status !== 'accepted') {
    return null;
  }
  
  const promiser = store.users.find(u => u.id === promise.promiserId);
  const promisee = store.users.find(u => u.id === promise.promiseeId);
  
  if (kept) {
    // Asymmetric payout: promiser gets stake back + 50% bonus, promisee gets 50% bonus
    const bonus = Math.floor(promise.stake * 0.5);
    if (promiser) promiser.trust += promise.stake + bonus;
    if (promisee) promisee.trust += bonus;
    promise.status = 'kept';
  } else {
    // Promisee gets the entire stake
    if (promisee) promisee.trust += promise.stake;
    promise.status = 'broken';
  }
  
  promise.resolvedAt = Date.now();
  return promise;
}
