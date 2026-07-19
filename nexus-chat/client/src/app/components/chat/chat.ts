import { Component, inject, signal, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ChatsService } from '../../services/chats';
import { MessagesService } from '../../services/MessagesService';
import { WebsocketService } from '../../services/websocket.service'; 

import { AddFriendComponent } from './modals/add-friend.component';
import { CreateGroupComponent } from './modals/create-group.component';
import { GroupSettingsComponent } from './modals/group-settings.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    AddFriendComponent,
    CreateGroupComponent,
    GroupSettingsComponent
  ],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class ChatComponent implements OnInit {
  private authService = inject(AuthService);
  private chatsService = inject(ChatsService);
  private messagesService = inject(MessagesService);
  private websocketService = inject(WebsocketService); 
  private router = inject(Router);

  currentUserId = signal<string>('');
  currentUsername = signal<string>('');

  chats = signal<any[]>([]); 
  friends = signal<any[]>([]); 
  messages = signal<any[]>([]); 

  searchQuery = '';
  activeFilter = signal<'all' | 'groups' | 'friends'>('all');

  loadingChats = signal<boolean>(false);
  loadingMessages = signal<boolean>(false);

  activeChat = signal<any>(null);
  newMessageText = signal<string>('');

  showAddFriend = signal<boolean>(false);
  showCreateGroup = signal<boolean>(false);
  showGroupSettings = signal<boolean>(false);

  constructor() {
    effect(() => {
      const chat = this.activeChat();
      if (chat && chat._id) {
        this.loadMessages(chat._id);
      }
    });
  }

  ngOnInit() {
    const id = localStorage.getItem('userId');
    const name = localStorage.getItem('username');

    if (!id || !name) {
      this.router.navigate(['/login']);
      return;
    }

    this.currentUserId.set(id);
    this.currentUsername.set(name);

    this.loadFriendsAndGroups();

    // 🚀 האוזנייה הקבועה שלנו! בכל פעם שהשרת משדר הודעה חדשה, אנחנו דוחפים אותה למסך בשבריר שנייה!
    this.websocketService.listen('messageReceived').subscribe({
      next: (newMsg) => {
        const chat = this.activeChat();
        // מוודאים שההודעה שייכת לצ'אט שפתוח אצלנו כרגע על המסך
        if (chat && newMsg.receivingChat === chat._id) {
          this.messages.update(prev => {
            // מונעים כפילויות תצוגה
            if (prev.some(m => m._id === newMsg._id)) return prev;
            return [...prev, newMsg];
          });
        }
      }
    });
  }

  loadFriendsAndGroups() {
    this.loadingChats.set(true);
    this.authService.getFriends().subscribe({
      next: (friendsList) => {
        this.friends.set(friendsList);
        
        const savedChats = localStorage.getItem(`chats_${this.currentUserId()}`);
        const groupChats = savedChats ? JSON.parse(savedChats) : [];
        
        const allChats = [
          ...groupChats,
          ...friendsList.map(f => ({ ...f, type: 'private', username: f.username, _id: f._id }))
        ];
        
        this.chats.set(allChats);
        this.loadingChats.set(false);
      },
      error: () => {
        this.loadingChats.set(false);
      }
    });
  }

  filteredItems() {
    const filter = this.activeFilter();
    const query = this.searchQuery.toLowerCase().trim();

    let list = [];
    if (filter === 'all') {
      list = this.chats();
    } else if (filter === 'groups') {
      list = this.chats().filter(c => c.type === 'group');
    } else if (filter === 'friends') {
      list = this.friends();
    }

    if (query) {
      list = list.filter(item => {
        const name = item.name || item.username || '';
        return name.toLowerCase().includes(query);
      });
    }

    return list;
  }

  getAvatarInitials(item: any): string {
    const name = item.name || item.username || '??';
    return name.substring(0, 2).toUpperCase();
  }

  // 💬 בחירת צ'אט והפיכתו לפעיל
  selectConversation(item: any) {
    if (item.type === 'group') {
      this.activeChat.set(item);
    } else {
      // 🚀 במקום ID מדומה - פונים לשרת שימצא או יצור שיחה אמיתית במונגו!
      this.chatsService.getOrCreatePrivateChat(item.username).subscribe({
        next: (realChat) => {
          this.activeChat.set(realChat);
        },
        error: (err) => {
          console.error('שגיאה בטעינת השיחה הפרטית:', err);
        }
      });
    }
  }

  // 📜 שליפת הודעות של צ'אט ספציפי
  loadMessages(chatId: string) {
    this.loadingMessages.set(true);
    this.messagesService.getChatMessages(chatId).subscribe({
      next: (msgList) => {
        this.messages.set(msgList);
        this.loadingMessages.set(false);
      },
      error: () => {
        this.messages.set([]);
        this.loadingMessages.set(false);
      }
    });
  }

  // ✉️ שליחת הודעה חדשה
  sendMessage() {
    const text = this.newMessageText().trim();
    const chat = this.activeChat();
    if (!text || !chat) return;

    this.messagesService.sendMessage(chat._id, text).subscribe({
      next: (newMsg) => {
        this.messages.update(prev => [...prev, newMsg]);
        this.newMessageText.set('');
      },
      error: (err) => {
        console.error('שגיאה בשליחת הודעה:', err);
      }
    });
  }

  saveGroupToLocal(group: any) {
    const key = `chats_${this.currentUserId()}`;
    const saved = localStorage.getItem(key);
    const list = saved ? JSON.parse(saved) : [];
    
    if (!list.some((c: any) => c._id === group._id)) {
      list.push({ ...group, type: 'group' });
      localStorage.setItem(key, JSON.stringify(list));
      this.chats.set([...list, ...this.friends().map(f => ({ ...f, type: 'private' }))]);
    }
  }

  onGroupCreated(createdGroup: any) {
    this.saveGroupToLocal(createdGroup);
    this.showCreateGroup.set(false);
    this.selectConversation(createdGroup);
  }

  onGroupUpdated(updatedGroup: any) {
    this.activeChat.set(updatedGroup);
    this.saveGroupToLocal(updatedGroup);
  }

  deleteFriend(event: Event, username: string) {
    event.stopPropagation();
    if (confirm(`האם אתה בטוח שברצונך למחוק את החבר ${username}?`)) {
      this.authService.deleteFriend(username).subscribe({
        next: () => {
          alert(`החבר ${username} נמחק בהצלחה.`);
          this.loadFriendsAndGroups();
          if (this.activeChat() && this.activeChat().username === username) {
            this.activeChat.set(null);
          }
        }
      });
    }
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}