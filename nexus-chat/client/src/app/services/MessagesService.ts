import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message, CreateMessageDto } from '../models/message.model';
@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  private readonly apiUrl = 'http://localhost:3000/messages';
  private http = inject(HttpClient);

  sendMessage(receivingChat: string, content: string): Observable<Message> {
    const body: CreateMessageDto = { receivingChat, content };
    return this.http.post<Message>(this.apiUrl, body);
  }

  getChatMessages(chatId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/${chatId}`);
  }
}