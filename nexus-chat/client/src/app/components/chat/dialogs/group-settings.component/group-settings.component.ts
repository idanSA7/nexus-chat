import { Component, inject, signal, input, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { ChatsService } from '../../../../services/ChatsService';
import { User } from '../../../../models/user.model';
import { Chat } from '../../../../models/chat.model';

@Component({
  selector: 'app-group-settings-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './group-settings.component.html',
  styleUrls: ['./group-settings.component.css']
})
export class GroupSettingsComponent implements OnInit {
  private chatsService = inject(ChatsService);

  activeChat = input<Chat | null>(null); 
  currentUsername = input<string>(''); 

  groupMembers = signal<User[]>([]); 
  groupSettingsName = signal<string>('');
  groupSettingsDesc = signal<string>('');
  newGroupMemberUsername = signal<string>('');

  close = output<void>();
  groupUpdated = output<Chat>(); 
  ngOnInit() {
    const chat = this.activeChat();
    if (chat) {
      this.groupSettingsName.set(chat.name || '');
      this.groupSettingsDesc.set(chat.description || '');
      this.loadGroupMembers(chat._id);
    }
  }

  loadGroupMembers(chatId: string) {
    this.chatsService.getGroupMembers(chatId).subscribe({
      next: (members: User[]) => this.groupMembers.set(members)
    });
  }

  updateGroupName() {
    const newName = this.groupSettingsName().trim();
    const chat = this.activeChat();
    if (!newName || !chat) return;

    this.chatsService.updateGroupName(chat._id, newName).subscribe({
      next: (updatedChat: Chat) => {
        this.groupSettingsName.set(updatedChat.name || '');
        this.groupUpdated.emit(updatedChat);
        alert('שם הקבוצה עודכן בהצלחה!');
      }
    });
  }

  updateGroupDescription() {
    const desc = this.groupSettingsDesc().trim();
    const chat = this.activeChat();
    if (!chat) return;

    this.chatsService.updateGroupDescription(chat._id, desc).subscribe({
      next: (updatedChat: Chat) => {
        this.groupSettingsDesc.set(updatedChat.description || '');
        this.groupUpdated.emit(updatedChat);
        alert('תיאור הקבוצה עודכן בהצלחה!');
      }
    });
  }

  addMemberToGroup() {
    const username = this.newGroupMemberUsername().trim();
    const chat = this.activeChat();
    if (!username || !chat) return;

    this.chatsService.addMemberToGroup(chat._id, username).subscribe({
      next: (updatedChat: Chat) => {
        this.loadGroupMembers(chat._id);
        this.newGroupMemberUsername.set('');
        this.groupUpdated.emit(updatedChat);
        alert(`המשתמש ${username} צורף בהצלחה!`);
      },
      error: (err: HttpErrorResponse) => {
        alert(err.error?.message || 'הוספת המשתמש נכשלה');
      }
    });
  }

  removeMemberFromGroup(username: string) {
    const chat = this.activeChat();
    if (!username || !chat) return;

    if (confirm(`האם אתה בטוח שברצונך להסיר את ${username} מהקבוצה?`)) {
      this.chatsService.removeMemberFromGroup(chat._id, username).subscribe({
        next: (updatedChat: Chat) => {
          this.loadGroupMembers(chat._id);
          this.groupUpdated.emit(updatedChat);
          alert(`המשתמש ${username} הוסר מהקבוצה.`);
        },
        error: (err: HttpErrorResponse) => {
          alert(err.error?.message || 'הסרת המשתמש נכשלה');
        }
      });
    }
  }
}