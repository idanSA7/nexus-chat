import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <!-- פס ירוק עליון בסגנון וואטסאפ ווב הקלאסי -->
    <div class="absolute top-0 left-0 w-full h-[220px] bg-[#00a884] z-0"></div>

    <main class="flex-grow flex flex-col items-center justify-center p-4 z-10 min-h-screen relative">
      
      <!-- לוגו וכותרת עליונה -->
      <div class="text-center mb-6 text-white">
        <div class="inline-flex items-center justify-center bg-white text-[#00a884] p-3 rounded-full shadow-lg mb-3">
          <span class="material-symbols-outlined text-4xl font-bold">forum</span>
        </div>
        <h1 class="text-3xl font-extrabold tracking-tight">NEXUS CHAT</h1>
        <p class="text-sm opacity-90 mt-1">מערכת הצ'אט המאובטחת שלך</p>
      </div>

      <!-- כרטיסיית הטופס המרכזית (Card) -->
      <div class="bg-white w-full max-w-[450px] p-8 md:p-10 rounded-2xl shadow-[0_17px_50px_0_rgba(0,0,0,0.19),0_12px_15px_0_rgba(0,0,0,0.24)] border-t-4 border-[#00a884] transition-all duration-300 transform hover:scale-[1.01]">
        
        <div class="flex justify-between items-center mb-8 border-b pb-4">
          <h2 class="text-2xl font-bold text-gray-800">
            {{ isRegisterMode() ? 'יצירת חשבון חדש' : 'התחברות לחשבון' }}
          </h2>
          <button 
            type="button" 
            (click)="toggleForm()" 
            class="text-[#00a884] hover:text-[#008f6c] text-sm font-semibold transition-colors focus:outline-none"
          >
            {{ isRegisterMode() ? 'כבר רשום? להתחברות' : 'להרשמה מהירה' }}
          </button>
        </div>

        <form [formGroup]="authForm" (ngSubmit)="handleSubmit()" class="space-y-6">
          
          <!-- שדה שם משתמש -->
          <div class="space-y-1 relative">
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider">שם משתמש</label>
            <div class="relative">
              <span class="material-symbols-outlined absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">person</span>
              <input 
                type="text" 
                formControlName="username"
                required
                class="w-full pl-4 pr-10 py-3 bg-[#f8f9fa] border border-gray-200 rounded-xl focus:border-[#00a884] focus:bg-white focus:ring-2 focus:ring-[#00a884]/20 transition-all outline-none text-gray-700 font-medium"
                placeholder="הקלד שם משתמש"
              />
            </div>
            @if (authForm.get('username')?.invalid && authForm.get('username')?.touched) {
              <p class="text-red-500 text-xs mt-1">שם משתמש תקין הוא חובה (לפחות 3 תווים)</p>
            }
          </div>

          <!-- שדה סיסמה -->
          <div class="space-y-1 relative">
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider">הקלד סיסמה</label>
            <div class="relative">
              <span class="material-symbols-outlined absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">lock</span>
              <input 
                type="password" 
                formControlName="password"
                required
                class="w-full pl-4 pr-10 py-3 bg-[#f8f9fa] border border-gray-200 rounded-xl focus:border-[#00a884] focus:bg-white focus:ring-2 focus:ring-[#00a884]/20 transition-all outline-none text-gray-700 font-medium"
                placeholder="הקלד סיסמה"
              />
            </div>
            @if (authForm.get('password')?.invalid && authForm.get('password')?.touched) {
              <p class="text-red-500 text-xs mt-1">הסיסמה חייבת להכיל לפחות 6 תווים</p>
            }
          </div>

          <!-- כפתור שליחה יפהפה -->
          <button 
            type="submit" 
            [disabled]="authForm.invalid || isLoading()"
            class="w-full bg-[#00a884] text-white font-bold py-3.5 px-4 rounded-xl hover:bg-[#008f6c] active:scale-[0.98] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-base disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <span>{{ getButtonText() }}</span>
            <span class="material-symbols-outlined text-lg">arrow_back</span>
          </button>

        </form>

        <!-- התראות דינמיות מהשרת -->
        @if (alertMessage()) {
          <div 
            [ngClass]="isError() ? 'bg-red-50 text-red-800 border-red-200' : 'bg-green-50 text-green-800 border-green-200'"
            class="mt-6 p-4 rounded-xl text-center font-medium text-sm border"
          >
            {{ alertMessage() }}
          </div>
        }

      </div>

      <!-- פס אבטחה תחתון -->
      <div class="mt-8 flex items-center gap-2 text-xs text-gray-500 max-w-[400px] text-center">
        <span class="material-symbols-outlined text-gray-400 text-sm">lock_reset</span>
        <span>הסיסמאות שלך מוצפנות מקצה לקצה (End-to-End Encrypted) בשרתי Nexus Chat.</span>
      </div>

    </main>
  `,
  styles: [`
    :host {
      display: block;
      background-color: #f0f2f5;
      min-height: 100vh;
      font-family: 'Assistant', sans-serif;
      direction: rtl;
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isRegisterMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  alertMessage = signal<string>('');
  isError = signal<boolean>(false);

  authForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  toggleForm() {
    this.isRegisterMode.set(!this.isRegisterMode());
    this.authForm.reset();
    this.alertMessage.set('');
  }

  getButtonText(): string {
    if (this.isLoading()) {
      return this.isRegisterMode() ? 'רושם אותך במערכת...' : 'מתחבר...';
    }
    return this.isRegisterMode() ? 'הרשם והכנס לצ\'אט' : 'התחבר עכשיו';
  }

  handleSubmit() {
    if (this.authForm.invalid) return;

    this.isLoading.set(true);
    this.alertMessage.set('');

    const formValues = this.authForm.value;
    const authObservable = this.isRegisterMode()
      ? this.authService.register(formValues)
      : this.authService.login(formValues);

    authObservable.subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.isError.set(false);

        if (this.isRegisterMode()) {
          this.alertMessage.set(`נרשמת בהצלחה! מעביר אותך למסך התחברות 🎉`);
          setTimeout(() => this.toggleForm(), 2000);
        } else {
          this.alertMessage.set(`התחברת בהצלחה! נכנס לצ'אט... 🚀`);
          
          // 🔑 שומרים את הנתונים האמיתיים של המשתמש בדפדפן!
          localStorage.setItem('username', response.username);
          localStorage.setItem('userId', response.userId);
          
          setTimeout(() => this.router.navigate(['/chat']), 1500);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.isError.set(true);
        this.alertMessage.set(err.error?.message || 'אופס! משהו השתבש בחיבור לשרת.');
      }
    });
  }
}