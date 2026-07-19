import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: Socket;

  constructor() {
    // מתחברים פיזית לברז ה-WebSocket של השרת בפורט 3000
    this.socket = io('http://localhost:3000');
  }

  // פונקציה לצעוק/לשדר (Emit) מידע לשרת
  emit(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  }

  // פונקציה להאזין (Listen) באופן קבוע להודעות שמגיעות מהשרת
  listen(eventName: string): Observable<any> {
    return new Observable((subscriber) => {
      // 🚀 תיקון קריטי: הגדרת data כ-any כדי למנוע את שגיאת ה-Implicit any של הקומפיילר!
      this.socket.on(eventName, (data: any) => {
        subscriber.next(data);
      });
    });
  }
}