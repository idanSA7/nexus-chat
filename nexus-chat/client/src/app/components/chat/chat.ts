import { Component, inject, signal, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ChatsService } from '../../services/ChatsService';
import { MessagesService } from '../../services/MessagesService';
import { WebsocketService } from '../../services/websocket.service'; 
import { User } from '../../models/user.model';
import { Chat } from '../../models/chat.model';
import { Message } from '../../models/message.model';
import { AddFriendComponent } from './dialogs/add-friend.component/add-friend.component';
import { CreateGroupComponent } from './dialogs/create-group.component/create-group.component';
import { GroupSettingsComponent } from './dialogs/group-settings.component/group-settings.component';

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

  chats = signal<Chat[]>([]); 
  friends = signal<User[]>([]); 
  messages = signal<Message[]>([]); 

  searchQuery = '';
  activeFilter = signal<'all' | 'groups' | 'friends'>('all');

  loadingChats = signal<boolean>(false);
  loadingMessages = signal<boolean>(false);

  activeChat = signal<Chat | null>(null);
  newMessageText = signal<string>('');

  showAddFriend = signal<boolean>(false);
  showCreateGroup = signal<boolean>(false);
  showGroupSettings = signal<boolean>(false);

  constructor() {
    effect(() => {
      const chat = this.activeChat();
      if (chat && chat._id) {
        this.loadMessages(chat._id);
        this.websocketService.emit('joinRoom', chat._id);
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

    // האזנה להודעות חדשות מצ'אט
    this.websocketService.listen<Message>('messageReceived').subscribe({
      next: (newMsg: Message) => {
        const chat = this.activeChat();
        if (chat && newMsg.receivingChat === chat._id) {
          this.messages.update(prev => {
            if (prev.some(m => m._id === newMsg._id)) return prev;
            return [...prev, newMsg];
          });
        }
      }
    });

    // האזנה לעדכוני קבוצה (יציאה / הסרה)
    this.websocketService.listen<{ updatedChat: Chat; removedUsername: string }>('groupUpdated').subscribe({
      next: ({ updatedChat, removedUsername }) => {
        const current = this.activeChat();
        if (current && current._id === updatedChat._id) {
          this.activeChat.set(updatedChat);

          // הוספת הודעת מערכת בצורה נקייה וקצרה
          this.messages.update(prev => [...prev, {
            _id: Date.now().toString(),
            content: `${removedUsername || 'משתמש'} יצא/ה מהקבוצה`,
            isSystemMessage: true
          } as Message]);
        }

        this.loadFriendsAndGroups();
      }
    });
  }

  loadFriendsAndGroups() {
    this.loadingChats.set(true);

    this.authService.getFriends().subscribe({
      next: (friendsList: User[]) => {
        this.friends.set(friendsList);

        this.chatsService.getGroups().subscribe({
          next: (groupChats: Chat[]) => {
            const allChats: Chat[] = [
              ...groupChats.map(g => ({ ...g, type: 'group' as const })),
              ...friendsList.map(f => ({ ...f, type: 'private' as const }))
            ];

            this.chats.set(allChats);
            this.loadingChats.set(false);
          },
          error: () => {
            const privateChats: Chat[] = friendsList.map(f => ({ ...f, type: 'private' as const, username: f.username, _id: f._id }));
            this.chats.set(privateChats);
            this.loadingChats.set(false);
          }
        });
      },
      error: () => {
        this.loadingChats.set(false);
      }
    });
  }

  filteredItems(): (Chat | User)[] {
    const filter = this.activeFilter();
    const query = this.searchQuery.toLowerCase().trim();

    let list: (Chat | User)[] = [];
    if (filter === 'all') {
      list = this.chats();
    } else if (filter === 'groups') {
      list = this.chats().filter(c => c.type === 'group');
    } else if (filter === 'friends') {
      list = this.friends();
    }

    if (query) {
      list = list.filter(item => {
        const name = ('name' in item && item.name) ? item.name : ('username' in item && item.username) ? item.username : '';
        return name.toLowerCase().includes(query);
      });
    }

    return list;
  }

  getAvatarInitials(item: Chat | User | null): string {
    if (!item) return '??';
    const name = ('name' in item && item.name) ? item.name : ('username' in item && item.username) ? item.username : '??';
    return name.substring(0, 2).toUpperCase();
  }

  selectConversation(item: Chat | User) {
    if ('type' in item && item.type === 'group') {
      this.activeChat.set(item as Chat);
    } else {
      const username = 'username' in item ? item.username : undefined;
      if (!username) return;

      this.chatsService.getOrCreatePrivateChat(username).subscribe({
        next: (realChat: Chat) => {
          this.activeChat.set(realChat);
        },
        error: (err: unknown) => {
          console.error('שגיאה בטעינת השיחה הפרטית:', err);
        }
      });
    }
  }

  loadMessages(chatId: string) {
    this.loadingMessages.set(true);
    this.messagesService.getChatMessages(chatId).subscribe({
      next: (msgList: Message[]) => {
        this.messages.set(msgList);
        this.loadingMessages.set(false);
      },
      error: () => {
        this.messages.set([]);
        this.loadingMessages.set(false);
      }
    });
  }

  sendMessage() {
    const text = this.newMessageText().trim();
    const chat = this.activeChat();
    if (!text || !chat) return;

    // שליחה ב-WebSocket בזמן אמת
    this.websocketService.emit('sendMessage', {
      chatId: chat._id,
      content: text
    });

    this.newMessageText.set('');
  }

  onGroupCreated(createdGroup: Chat) {
    this.showCreateGroup.set(false);
    this.loadFriendsAndGroups(); 
    this.selectConversation({ ...createdGroup, type: 'group' });
  }

  onGroupUpdated(updatedGroup: Chat) {
    this.activeChat.set(updatedGroup);
    this.loadFriendsAndGroups(); 
  }

  deleteFriend(event: Event, username: string) {
    event.stopPropagation();
    if (confirm(`האם אתה בטוח שברצונך למחוק את החבר ${username}?`)) {
      this.authService.deleteFriend(username).subscribe({
        next: () => {
          alert(`החבר ${username} נמחק בהצלחה.`);
          this.loadFriendsAndGroups();
          const active = this.activeChat();
          if (active && 'username' in active && active.username === username) {
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