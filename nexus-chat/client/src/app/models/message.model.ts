// src/app/models/message.model.ts
import { User } from './user.model';

export interface Message {
  _id: string;
  sendingUser: User;        
  receivingChat: string;     
  content: string;
  createdAt: string | Date;
  isSystemMessage?: boolean; 
}

export interface CreateMessageDto {
  receivingChat: string;     
  content: string;
}