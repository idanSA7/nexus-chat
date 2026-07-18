import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  private readonly apiUrl = 'http://localhost:3000/messages';
  private http = inject(HttpClient);

  // ✉️ שליחת הודעה חדשה
  sendMessage(chatId: string, content: string): Observable<any> {
    return this.http.post(this.apiUrl, { chatId, content });
  }

  // 📜 שליפת היסטוריית ההודעות של צ'אט ספציפי
  getChatMessages(chatId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${chatId}`);
  }
}