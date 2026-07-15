import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { FormGroup, FormControl } from '@angular/forms';
import { AuthService } from '../services/auth';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {
  private authService = inject(AuthService); 
  message = signal<string>('');

  
  registerForm = new FormGroup({
   username: new FormControl('', [Validators.required]),
    password: new FormControl('')
  });
   onSubmit() {
    if (this.registerForm.valid) {
      // subscribe!
      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          console.log('השרת ענה:', response);
          this.message.set('נרשמת בהצלחה!');
        },
        error: (err) => {
          console.error('השרת החזיר שגיאה:', err);
          this.message.set('משהו השתבש...');
        }
      });
    }
  }
}
