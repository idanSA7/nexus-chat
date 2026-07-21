// src/app/models/friendship.model.ts
import { User } from './user.model';

export type FriendshipStatus = 'pending' | 'accepted' | 'blocked'; // 👈 התווסף blocked

export interface Friendship {
  _id: string;
  sendingUser: User;
  receivingUser: User;
  status: FriendshipStatus;
  createdAt?: string | Date;
}