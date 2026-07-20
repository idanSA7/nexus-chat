import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-add-friend-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-friend.component.html',
  styleUrls: ['./add-friend.component.css']
})
export class AddFriendComponent {
  private authService = inject(AuthService);

  friendRequestUsername = signal<string>((''));
  friendAdded = output<void>(); 
  close= output<void>(); 

  addFriend() {
    const username = this.friendRequestUsername().trim();
    if (!username) return;

    this.authService.sendFriendRequest(username).subscribe({
      next: () => {
        this.friendRequestUsername.set('');
        alert(`החבר ${username} נוסף בהצלחה לרשימה! `);
        this.friendAdded.emit(); 
        this.close.emit();
      },
      error: (err) => {
        alert(err.error?.message || 'משתמש לא נמצא או שאתם כבר חברים.');
      }
    });
  }
}