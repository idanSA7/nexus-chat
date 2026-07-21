import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, AuthResponse } from '../models/user.model';
import { Friendship } from '../models/Friendship.model';
export interface AuthDto {
  username: string;
  password?: string;
}

export interface ActionResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:3000/users';
  private http = inject(HttpClient);

  register(userData: AuthDto): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, userData);
  }

  login(userData: AuthDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, userData);
  }

  // sendFriendRequest
  sendFriendRequest(targetUsername: string): Observable<ActionResponse> {
    return this.http.post<ActionResponse>(`${this.apiUrl}/friendRequest`, { targetUsername });
  }

  // deleteFriend
  deleteFriend(targetUsername: string): Observable<ActionResponse> {
    return this.http.request<ActionResponse>('delete', `${this.apiUrl}/deleteFriend`, {
      body: { targetUsername }
    });
  }

  // acceptFriend
  acceptFriend(targetUsername: string): Observable<ActionResponse> {
    return this.http.patch<ActionResponse>(`${this.apiUrl}/acceptFriend`, { targetUsername });
  }

  // getfriend
  getFriends(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/friends`);
  }

  // getPendingRequests
  getPendingRequests(): Observable<Friendship[]> {
    return this.http.get<Friendship[]>(`${this.apiUrl}/friendRequests/pending`);
  }
}