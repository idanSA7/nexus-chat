import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Chat, CreateGroupDto } from '../models/chat.model';
import { User } from '../models/user.model';
export interface ActionResponse {
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatsService {
  private readonly apiUrl = 'http://localhost:3000/chats';
  private http = inject(HttpClient);

  createGroup(name: string, members: string[]): Observable<Chat> {
    const body: CreateGroupDto = { name, members };
    return this.http.post<Chat>(`${this.apiUrl}/group`, body);
  }

  getGroupMembers(chatId: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/${chatId}/members`);
  }

  updateGroupName(chatId: string, name: string): Observable<Chat> {
    return this.http.patch<Chat>(`${this.apiUrl}/${chatId}/name`, { name });
  }

  updateGroupDescription(chatId: string, description: string): Observable<Chat> {
    return this.http.patch<Chat>(`${this.apiUrl}/${chatId}/description`, { description });
  }

  addMemberToGroup(chatId: string, username: string): Observable<Chat> {
    return this.http.patch<Chat>(`${this.apiUrl}/${chatId}/add-member`, { username });
  }

  removeMemberFromGroup(chatId: string, username: string): Observable<Chat> {
    return this.http.patch<Chat>(`${this.apiUrl}/${chatId}/remove-member`, { username });
  }

  getOrCreatePrivateChat(targetUsername: string): Observable<Chat> {
    return this.http.get<Chat>(`${this.apiUrl}/private/${targetUsername}`);
  }

  getGroups(): Observable<Chat[]> {
    return this.http.get<Chat[]>(`${this.apiUrl}/groups`); 
  }
}