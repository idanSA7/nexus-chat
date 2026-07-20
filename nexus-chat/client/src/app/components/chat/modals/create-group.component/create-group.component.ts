import { Component, inject, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatsService } from '../../../../services/ChatsService';

@Component({
  selector: 'app-create-group-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-group.component.html',
  styleUrls: ['./create-group.component.css']
})
export class CreateGroupComponent {
  private chatsService = inject(ChatsService);

  friends = input<any[]>([]); // מקבל את רשימת החברים מקומפוננטת האב
  
  groupName = signal<string>('');
  selectedFriends = signal<string[]>([]);

  close = output<void>();
  groupCreated = output<any>(); // מחזיר לאב את אובייקט הקבוצה החדש שנוצר

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
      next: (createdGroup) => {
        this.groupName.set('');
        this.selectedFriends.set([]);
        this.groupCreated.emit(createdGroup); // שליחת הקבוצה החדשה לאבא לשמירה ולפתיחה
      },
      error: (err) => {
        alert(err.error?.message || 'שגיאה ביצירת הקבוצה');
      }
    });
  }
}