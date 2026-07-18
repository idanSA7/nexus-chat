import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // ייבוא withInterceptors!
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor'; // ייבוא הצינור החכם שלנו

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(), 
    provideRouter(routes),
    // 🚀 מפעילים את ה-HttpClient יחד עם הצינור שמצמיד את מזהה המשתמש לכל פנייה!
    provideHttpClient(withInterceptors([authInterceptor])) 
  ]
};