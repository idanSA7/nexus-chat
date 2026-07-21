import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { AuthService, AuthDto } from '../../services/auth.service';
import { AuthResponse } from '../../models/user.model';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html', 
  styleUrls: ['./login.css']    
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isRegisterMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  alertMessage = signal<string>('');
  isError = signal<boolean>(false);

  authForm = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] })
  });

  changeMode() {
    this.isRegisterMode.set(!this.isRegisterMode());
    this.authForm.reset();
    this.alertMessage.set('');
  }

  updateButtonText(): string {
    if (this.isLoading()) {
      return this.isRegisterMode() ? 'רושם אותך במערכת...' : 'מתחבר...';
    }
    return this.isRegisterMode() ? 'הרשם והכנס לצ\'אט' : 'התחבר עכשיו';
  }

  submitForm() {
    if (this.authForm.invalid) return;

    this.isLoading.set(true);
    this.alertMessage.set('');

    const formValues: AuthDto = this.authForm.getRawValue();

    if (this.isRegisterMode()) {
      this.authService.register(formValues).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.isError.set(false);
          this.alertMessage.set(`נרשמת בהצלחה! מעביר אותך למסך התחברות`);
          setTimeout(() => this.changeMode(), 2000);
        },
        error: (err: HttpErrorResponse) => {
          this.handleError(err);
        }
      });
    } else {
      this.authService.login(formValues).subscribe({
        next: (response: AuthResponse) => {
          this.isLoading.set(false);
          this.isError.set(false);
          this.alertMessage.set(`התחברת בהצלחה! נכנס לצ'אט.`);

          localStorage.setItem('username', response.username);
          localStorage.setItem('userId', response.userId);

          setTimeout(() => this.router.navigate(['/chat']), 1500);
        },
        error: (err: HttpErrorResponse) => {
          this.handleError(err);
        }
      });
    }
  }

  private handleError(err: HttpErrorResponse) {
    this.isLoading.set(false);
    this.isError.set(true);
    this.alertMessage.set(err.error?.message || 'אופס! משהו השתבש בחיבור לשרת.');
  }
}