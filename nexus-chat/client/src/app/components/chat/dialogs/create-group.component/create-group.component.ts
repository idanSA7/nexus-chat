import { Component, inject, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { ChatsService } from '../../../../services/ChatsService';
import { User } from '../../../../models/user.model';
import { Chat } from '../../../../models/chat.model';
@Component({
  selector: 'app-create-group-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-group.component.html',
  styleUrls: ['./create-group.component.css']
})
export class CreateGroupComponent {
  private chatsService = inject(ChatsService);

  friends = input<User[]>([]); 
  
  groupName = signal<string>('');
  selectedFriends = signal<string[]>([]);

  close = output<void>();
  groupCreated = output<Chat>(); 

  toggleFriend(username: string) {
    this.selectedFriends.update(list => {
      if (list.includes(username)) {
        return list.filter(u => u !== username);
      } else {
        return [...list, username];
      }
    });
  }

  submitGroup() {
    const name = this.groupName().trim();
    const members = this.selectedFriends();

    if (!name || members.length === 0) return;

    this.chatsService.createGroup(name, members).subscribe({
      next: (createdGroup: Chat) => {
        this.groupName.set('');
        this.selectedFriends.set([]);
        this.groupCreated.emit(createdGroup);
      },
      error: (err: HttpErrorResponse) => {
        alert(err.error?.message || 'שגיאה ביצירת הקבוצה');
      }
    });
  }
}