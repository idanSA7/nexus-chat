import { Component, inject, signal, input, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatsService } from '../../../../services/ChatsService';

@Component({
  selector: 'app-group-settings-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './group-settings.component.html',
  styleUrls: ['./group-settings.component.css']
})
export class GroupSettingsComponent implements OnInit {
  private chatsService = inject(ChatsService);

  activeChat = input<any>(null);// בהמשך אני אצור ממשק של מה מקבלים
  currentUsername = input<string>(''); 

  groupMembers = signal<any[]>([]);// בהמשך אני אצור ממשק של מה מקבלים
  groupSettingsName = signal<string>('');
  groupSettingsDesc = signal<string>('');
  newGroupMemberUsername = signal<string>('');

  close = output<void>();
  groupUpdated = output<any>(); 

  ngOnInit() {
    const chat = this.activeChat();
    if (chat) {
      this.groupSettingsName.set(chat.name || '');/////////////////////////////////////////////////////////
      this.groupSettingsDesc.set(chat.description || '');
      this.loadGroupMembers(chat._id);
    }
  }

  loadGroupMembers(chatId: string) {
    this.chatsService.getGroupMembers(chatId).subscribe({
      next: (members) => this.groupMembers.set(members)
    });
  }

  updateGroupName() {
    const newName = this.groupSettingsName().trim();//////////////////////////////////////////////
    const chat = this.activeChat();
    if (!newName || !chat) return;

    this.chatsService.updateGroupName(chat._id, newName).subscribe({
      next: (updatedChat) => {
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
      next: (updatedChat) => {
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
      next: (updatedChat) => {
        this.loadGroupMembers(chat._id);
        this.newGroupMemberUsername.set('');
        this.groupUpdated.emit(updatedChat);
        alert(`המשתמש ${username} צורף בהצלחה!`);
      },
      error: (err) => {
        alert(err.error?.message || 'הוספת המשתמש נכשלה');
      }
    });
  }

  removeMemberFromGroup(username: string) {
    const chat = this.activeChat();
    if (!username || !chat) return;

    if (confirm(`האם אתה בטוח שברצונך להסיר את ${username} מהקבוצה?`)) {
      this.chatsService.removeMemberFromGroup(chat._id, username).subscribe({
        next: (updatedChat) => {
          this.loadGroupMembers(chat._id);
          this.groupUpdated.emit(updatedChat);
          alert(`המשתמש ${username} הוסר מהקבוצה.`);
        },
        error: (err) => {
          alert(err.error?.message || 'הסרת המשתמש נכשלה');
        }
      });
    }
  }
}