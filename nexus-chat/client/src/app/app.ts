import { Component } from '@angular/core';
// 1. תוסיף את השורה הזאת למעלה (תבדוק שהנתיב נכון, אולי זה ./register/register)
import { Register } from './register/register'; 

@Component({
  selector: 'app-root',
  standalone: true,
  // 2. תוסיף את Register למערך ה-imports כאן!
  imports: [Register], 
  templateUrl: './app.html'
})
export class AppComponent {
}