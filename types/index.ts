export interface User {
  id: string;
  username: string;
  vows: number; // currency
  createdAt: number;
}

export type PromiseStatus = 'pending' | 'accepted' | 'kept' | 'broken' | 'declined';

export interface Promise {
  id: string;
  promiserId: string;
  promiseeId: string;
  description: string;
  stake: number; // amount each party puts in
  status: PromiseStatus;
  createdAt: number;
  resolvedAt?: number;
}

export interface AppState {
  users: User[];
  promises: Promise[];
  currentUser: User | null;
}
