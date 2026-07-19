import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-[#f0f2f5] p-4" style="direction: rtl;">
      <div class="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border-t-4 border-[#00a884]">
        <h2 class="text-2xl font-bold text-gray-800 text-center mb-6">הרשמה ל-Nexus Chat</h2>
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-500 mb-1">שם משתמש</label>
            <input 
              type="text" 
              formControlName="username"
              class="w-full px-4 py-2.5 bg-[#f8f9fa] border border-gray-200 rounded-xl outline-none focus:border-[#00a884] focus:bg-white transition-all text-sm font-medium"
              placeholder="לפחות 3 תווים"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-500 mb-1">סיסמה</label>
            <input 
              type="password" 
              formControlName="password"
              class="w-full px-4 py-2.5 bg-[#f8f9fa] border border-gray-200 rounded-xl outline-none focus:border-[#00a884] focus:bg-white transition-all text-sm font-medium"
              placeholder="לפחות 6 תווים"
            />
          </div>

          <button 
            type="submit" 
            [disabled]="registerForm.invalid"
            class="w-full bg-[#00a884] hover:bg-[#008f6c] text-white font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
          >
            הרשם עכשיו
          </button>
        </form>

        @if (message()) {
          <div class="mt-4 p-3 bg-green-50 text-green-800 rounded-xl border border-green-200 text-center text-xs font-medium">
            {{ message() }}
          </div>
        }
      </div>
    </div>
  `
})
export class Register {
  private authService = inject(AuthService);
  message = signal<string>('');

  registerForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.message.set('רושם אותך במערכת...');
    const formValues = this.registerForm.value;

    this.authService.register(formValues).subscribe({
      next: (response: any) => {
        console.log('תשובת השרת:', response);
        this.message.set('נרשמת בהצלחה! 🎉');
      },
      error: (err: any) => {
        console.error('שגיאת שרת:', err);
        this.message.set(err.error?.message || 'משהו השתבש ברישום...');
      }
    });
  }
}
