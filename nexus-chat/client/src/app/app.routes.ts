import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { ChatComponent } from './components/chat/chat';   

export const routes: Routes = [
  // 1. נתיב ברירת המחדל - העברה אוטומטית למסך ההתחברות
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // 2. נתיב למסך ההתחברות וההרשמה הראשי בסגנון וואטסאפ
  { path: 'login', component: LoginComponent },

  
  // 3. נתיב למסך הצ'אט הראשי
  { path: 'chat', component: ChatComponent }
];