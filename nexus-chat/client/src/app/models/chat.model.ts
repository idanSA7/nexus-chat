import { User } from './user.model';

export type ChatType = 'private' | 'group';

export interface Chat {
  _id: string;
  name?: string;
  description?: string;
  type?: 'group' | 'private';
  username?: string; 
  members?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGroupDto {
  name: string;
  description?: string;        
  members: string[];
}