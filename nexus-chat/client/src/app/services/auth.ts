import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:3000/users/register';
  private http = inject(HttpClient);

  // פונקציה ששולחת את המידע לשרת
  register(userData: any): Observable<any> {
    return this.http.post(this.apiUrl, userData);
  }
}