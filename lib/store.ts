import { User, Promise, AppState } from '../types';

// In-memory store (replace with database in production)
// This persists across requests during server runtime

const defaultUsers: User[] = [
  { id: '1', username: 'alice', vows: 100, createdAt: Date.now() - 86400000 },
  { id: '2', username: 'bob', vows: 100, createdAt: Date.now() - 86400000 },
  { id: '3', username: 'charlie', vows: 100, createdAt: Date.now() - 86400000 },
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
    vows: 100,
    createdAt: Date.now(),
  };
  store.users.push(newUser);
  return newUser;
}

export function updateUserVows(userId: string, vows: number): void {
  const store = getStore();
  const user = store.users.find(u => u.id === userId);
  if (user) {
    user.vows = vows;
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
  
  // Deduct stake from promiser
  const promiser = store.users.find(u => u.id === promiserId);
  if (promiser) {
    promiser.vows -= stake;
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
  
  // Deduct stake from promisee
  const promisee = store.users.find(u => u.id === userId);
  if (promisee) {
    promisee.vows -= promise.stake;
  }
  
  promise.status = 'accepted';
  return promise;
}

export function declinePromise(promiseId: string, userId: string): Promise | null {
  const store = getStore();
  const promise = store.promises.find(p => p.id === promiseId);
  
  if (!promise || promise.promiseeId !== userId || promise.status !== 'pending') {
    return null;
  }
  
  // Refund promiser
  const promiser = store.users.find(u => u.id === promise.promiserId);
  if (promiser) {
    promiser.vows += promise.stake;
  }
  
  promise.status = 'declined';
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
    // Both get stake back + 50% bonus
    const bonus = Math.floor(promise.stake * 0.5);
    if (promiser) promiser.vows += promise.stake + bonus;
    if (promisee) promisee.vows += promise.stake + bonus;
    promise.status = 'kept';
  } else {
    // Promisee gets entire pot
    if (promisee) promisee.vows += promise.stake * 2;
    promise.status = 'broken';
  }
  
  promise.resolvedAt = Date.now();
  return promise;
}
