import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: Socket;

  constructor() {
    const userId = localStorage.getItem('userId') || '';

    this.socket = io('http://localhost:3000', {
      extraHeaders: {
        'x-user-id': userId
      }
    });
  }

  emit(eventName: string, data: unknown): void {
    this.socket.emit(eventName, data);
  }

  listen<T>(eventName: string): Observable<T> {
    return new Observable((subscriber) => {
      this.socket.on(eventName, (data: T) => {
        subscriber.next(data);
      });
    });
  }
}