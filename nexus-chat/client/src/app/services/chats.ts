import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatsService {
  private readonly apiUrl = 'http://localhost:3000/chats';
  private http = inject(HttpClient);

  // 👥 יצירת קבוצה חדשה במערכת
  createGroup(name: string, members: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/group`, { name, members });
  }

  // ✏️ עדכון שם קבוצה קיימת
  updateGroupName(chatId: string, name: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${chatId}/name`, { name });
  }

  // 📝 עדכון תיאור קבוצה
  updateGroupDescription(chatId: string, description: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${chatId}/description`, { description });
  }

  // 👥 שליפת חברי קבוצה
  getGroupMembers(chatId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${chatId}/members`);
  }

  // ➕ הוספת חבר חדש לקבוצה קיימת
  addMemberToGroup(chatId: string, username: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${chatId}/add-member`, { username });
  }

  // ➖ הסרת חבר מקבוצה קיימת
  removeMemberFromGroup(chatId: string, username: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${chatId}/remove-member`, { username });
  }
}