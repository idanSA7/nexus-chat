import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service'; // תיקון נתיב הייבוא למיקום החדש!

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html'
})
export class Register {
  private authService = inject(AuthService); // הזרקת השירות המעודכן
  message = signal<string>('');

  registerForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  onSubmit() {
    if (this.registerForm.valid) {
      this.message.set('רושם אותך במערכת...');
      
      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          console.log('תשובת השרת:', response);
          this.message.set('נרשמת בהצלחה! 🎉');
        },
        error: (err) => {
          console.error('שגיאת שרת:', err);
          this.message.set(err.error?.message || 'משהו השתבש ברישום...');
        }
      });
    }
  }
}