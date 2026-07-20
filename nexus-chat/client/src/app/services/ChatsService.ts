import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatsService {
  private readonly apiUrl = 'http://localhost:3000/chats';
  private http = inject(HttpClient);

  createGroup(name: string, members: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/group`, { name, members });
  }

  getGroupMembers(chatId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${chatId}/members`);
  }

  updateGroupName(chatId: string, name: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${chatId}/name`, { name });
  }

  updateGroupDescription(chatId: string, description: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${chatId}/description`, { description });
  }

  addMemberToGroup(chatId: string, username: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${chatId}/add-member`, { username });
  }

  removeMemberFromGroup(chatId: string, username: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${chatId}/remove-member`, { username });
  }

  getOrCreatePrivateChat(targetUsername: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/private/${targetUsername}`);
  }
  getGroups(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/groups`); 
}
}