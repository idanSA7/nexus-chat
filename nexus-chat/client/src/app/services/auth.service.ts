import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:3000/users';
  private http = inject(HttpClient);

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, userData);
  }

  // 👥 שליחת בקשת חברות חדשה
  sendFriendRequest(targetUsername: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/friendRequest`, { targetUsername });
  }

  // ❌ מחיקת חבר קיים
  deleteFriend(targetUsername: string): Observable<any> {
    return this.http.request('delete', `${this.apiUrl}/deleteFriend`, {
      body: { targetUsername }
    });
  }

  // 🤝 אישור בקשת חברות ממתינה
  acceptFriend(targetUsername: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/acceptFriend`, { targetUsername });
  }

  // 📜 שליפת כל החברים המאושרים שלי
  getFriends(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/friends`);
  }

  // 📥 שליפת כל בקשות החברות שממתינות לאישור שלי
  getPendingRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/friendRequests/pending`);
  }
}