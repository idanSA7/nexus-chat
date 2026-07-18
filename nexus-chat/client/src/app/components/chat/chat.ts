import { Component, inject, signal, OnInit, effect, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ChatsService } from '../../services/chats';
import { MessagesService } from '../../services/messages';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-screen w-screen flex bg-[#111b21] text-[#e9edef] font-sans overflow-hidden select-none">
      
      <!-- ================= SIDEBAR (LEFT) ================= -->
      <aside class="w-[400px] border-l border-[#222e35] flex flex-col bg-[#111b21] shrink-0 relative z-20">
        
        <!-- Sidebar Header -->
        <header class="h-[60px] bg-[#202c33] px-4 flex justify-between items-center shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center font-bold text-white shadow-md">
              {{ currentUsername().substring(0, 2).toUpperCase() }}
            </div>
            <span class="font-semibold text-sm tracking-wide text-gray-200">שלום, {{ currentUsername() }}</span>
          </div>
          
          <!-- Actions Menu -->
          <div class="flex items-center gap-1.5 text-[#aebac1]">
            <button (click)="openAddFriendModal()" title="שלח בקשת חברות" class="p-2 hover:bg-[#374248] rounded-full transition-colors active:scale-95">
              <span class="material-symbols-outlined text-xl">person_add</span>
            </button>
            <button (click)="openAcceptFriendModal()" title="בקשות חברות ממתינות" class="p-2 hover:bg-[#374248] rounded-full transition-colors relative active:scale-95">
              <span class="material-symbols-outlined text-xl">group_add</span>
            </button>
            <button (click)="openCreateGroupModal()" title="קבוצה חדשה" class="p-2 hover:bg-[#374248] rounded-full transition-colors active:scale-95">
              <span class="material-symbols-outlined text-xl">chat_bubble_outline</span>
            </button>
            <button (click)="logout()" title="התנתק מהמערכת" class="p-2 hover:bg-[#374248] rounded-full text-red-400 transition-colors active:scale-95">
              <span class="material-symbols-outlined text-xl">logout</span>
            </button>
          </div>
        </header>

        <!-- Search & Filter Bar -->
        <div class="p-2 bg-[#111b21] border-b border-[#222e35] shrink-0">
          <div class="bg-[#202c33] rounded-lg px-3 py-1.5 flex items-center gap-3">
            <span class="material-symbols-outlined text-sm text-[#8696a0]">search</span>
            <input 
              type="text" 
              [(ngModel)]="searchQuery"
              placeholder="חפש או התחל שיחה חדשה" 
              class="bg-transparent border-none outline-none text-sm w-full placeholder-[#8696a0]"
            />
          </div>
          
          <!-- Filters (WhatsApp Style) -->
          <div class="flex gap-2 mt-3 px-1">
            <button (click)="activeFilter.set('all')" [class]="activeFilter() === 'all' ? 'bg-[#00a884] text-[#111b21] font-semibold' : 'bg-[#202c33] text-[#8696a0] hover:bg-[#2a3942]'" class="px-3 py-1 rounded-full text-xs transition-all active:scale-95">הכל</button>
            <button (click)="activeFilter.set('groups')" [class]="activeFilter() === 'groups' ? 'bg-[#00a884] text-[#111b21] font-semibold' : 'bg-[#202c33] text-[#8696a0] hover:bg-[#2a3942]'" class="px-3 py-1 rounded-full text-xs transition-all active:scale-95">קבוצות</button>
            <button (click)="activeFilter.set('friends')" [class]="activeFilter() === 'friends' ? 'bg-[#00a884] text-[#111b21] font-semibold' : 'bg-[#202c33] text-[#8696a0] hover:bg-[#2a3942]'" class="px-3 py-1 rounded-full text-xs transition-all active:scale-95">חברים</button>
          </div>
        </div>

        <!-- Scrollable Conversation/Friends List -->
        <div class="flex-grow overflow-y-auto divide-y divide-[#222e35] custom-scrollbar">
          
          <!-- Loading state -->
          @if (loadingChats()) {
            <div class="p-8 text-center text-[#8696a0] flex flex-col items-center gap-2">
              <span class="w-6 h-6 border-2 border-[#00a884] border-t-transparent rounded-full animate-spin"></span>
              <span class="text-xs">טוען נתונים...</span>
            </div>
          }

          <!-- Empty list message -->
          @if (filteredItems().length === 0 && !loadingChats()) {
            <div class="p-8 text-center text-[#8696a0]">
              <span class="material-symbols-outlined text-4xl opacity-50 mb-2">forum</span>
              <p class="text-sm">אין פריטים להצגה</p>
            </div>
          }

          <!-- Render list items -->
          @for (item of filteredItems(); track item._id || item.username) {
            <div 
              (click)="selectConversation(item)"
              [class.bg-[#2a3942]]="activeChat() && (activeChat()._id === item._id || activeChat().username === item.username)"
              class="flex items-center gap-3 px-3.5 py-3 hover:bg-[#202c33] cursor-pointer transition-all duration-150 relative group"
            >
              <!-- Avatar -->
              <div [class]="item.type === 'group' ? 'bg-[#223a34] text-[#00a884]' : 'bg-[#2a3942] text-[#8696a0]'" class="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                {{ getAvatarInitials(item) }}
              </div>
              
              <!-- Chat Info -->
              <div class="flex-grow min-w-0">
                <div class="flex justify-between items-baseline mb-1">
                  <h3 class="font-semibold text-[15px] truncate text-gray-100">{{ item.name || item.username }}</h3>
                  <span class="text-[11px] text-[#8696a0] shrink-0">{{ item.type === 'group' ? 'קבוצה' : 'חבר' }}</span>
                </div>
                <p class="text-xs text-[#8696a0] truncate">
                  {{ item.description || (item.type === 'group' ? 'לחץ לצפייה בפרטי הקבוצה...' : 'לחץ לפתיחת שיחה פרטית מאובטחת') }}
                </p>
              </div>

              <!-- Delete friend direct action -->
              @if (item.type !== 'group' && item.username) {
                <button 
                  (click)="deleteFriend($event, item.username)"
                  class="absolute left-4 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-[#111b21] hover:bg-red-900/40 text-red-400 rounded-full"
                  title="מחק חבר"
                >
                  <span class="material-symbols-outlined text-sm">person_remove</span>
                </button>
              }
            </div>
          }

        </div>
      </aside>

      <!-- ================= MAIN CHAT PANE (RIGHT) ================= -->
      <main class="flex-grow flex flex-col bg-[#0b141a] relative z-10">
        
        <!-- Classic WhatsApp doodle overlay background pattern -->
        <div class="absolute inset-0 opacity-[0.06] pointer-events-none z-0 bg-repeat bg-center" style="background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png');"></div>

        @if (activeChat()) {
          <!-- Chat Header -->
          <header class="h-[60px] bg-[#202c33] px-4 flex justify-between items-center shrink-0 z-10 border-r border-[#222e35]">
            <div class="flex items-center gap-3">
              <div [class]="activeChat().type === 'group' ? 'bg-[#223a34] text-[#00a884]' : 'bg-[#2a3942] text-[#8696a0]'" class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                {{ getAvatarInitials(activeChat()) }}
              </div>
              <div>
                <h2 class="font-semibold text-sm text-gray-100">{{ activeChat().name || activeChat().username }}</h2>
                <p class="text-[11px] text-[#8696a0] mt-0.5">
                  {{ activeChat().type === 'group' ? 'שיחה קבוצתית' : 'שיחה פרטית מאובטחת' }}
                </p>
              </div>
            </div>

            <!-- Header Actions -->
            <div class="flex items-center gap-1.5 text-[#aebac1]">
              @if (activeChat().type === 'group') {
                <button (click)="openGroupSettingsModal()" title="ניהול קבוצה" class="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a3942] hover:bg-[#374248] text-xs text-white rounded-lg transition-colors font-medium active:scale-95">
                  <span class="material-symbols-outlined text-sm">settings</span>
                  <span>ניהול קבוצה</span>
                </button>
              }
              <button class="p-2 hover:bg-[#374248] rounded-full transition-colors"><span class="material-symbols-outlined text-xl">search</span></button>
              <button class="p-2 hover:bg-[#374248] rounded-full transition-colors"><span class="material-symbols-outlined text-xl">more_vert</span></button>
            </div>
          </header>

          <!-- Messages Area -->
          <div class="flex-grow overflow-y-auto px-6 py-4 flex flex-col gap-2.5 custom-scrollbar relative z-10" #scrollContainer>
            
            @if (loadingMessages()) {
              <div class="m-auto text-center text-[#8696a0] flex flex-col items-center gap-2">
                <span class="w-8 h-8 border-2 border-[#00a884] border-t-transparent rounded-full animate-spin"></span>
                <span class="text-xs">מביא היסטוריית שיחות...</span>
              </div>
            }

            @if (messages().length === 0 && !loadingMessages()) {
              <div class="m-auto text-center max-w-[300px] text-[#8696a0] bg-[#111b21]/70 p-6 rounded-2xl border border-[#222e35]">
                <span class="material-symbols-outlined text-4xl text-[#00a884] mb-2">lock</span>
                <h4 class="font-bold text-gray-200 mb-1">תחילת שיחה מאובטחת</h4>
                <p class="text-[11px] leading-relaxed">הודעות בשיחה זו מוצפנות מקצה לקצה. אף אחד מחוץ לצ'אט לא יכול לקרוא אותן.</p>
              </div>
            }

            <!-- Loop Messages -->
            @for (msg of messages(); track msg._id; let last = $last) {
              <div 
                [class]="msg.sendingUser?._id === currentUserId() ? 'justify-start' : 'justify-end'"
                class="flex w-full"
              >
                <!-- Message Bubble -->
                <div 
                  [class]="msg.sendingUser?._id === currentUserId() ? 'bg-[#005c4b] text-white rounded-tr-none' : 'bg-[#202c33] text-gray-100 rounded-tl-none'"
                  class="max-w-[65%] min-w-[80px] p-2.5 rounded-2xl shadow-md relative scale-in"
                >
                  <!-- Sender Username in Group -->
                  @if (activeChat().type === 'group' && msg.sendingUser?._id !== currentUserId()) {
                    <span class="block text-[11px] font-bold text-[#00a884] mb-0.5">
                      {{ msg.sendingUser?.username || 'אורח' }}
                    </span>
                  }
                  
                  <p class="text-sm leading-relaxed break-words pl-12">{{ msg.content }}</p>
                  
                  <!-- Time and delivery status -->
                  <div class="absolute bottom-1 left-2 flex items-center gap-1 select-none">
                    <span class="text-[9px] text-gray-300 opacity-80">{{ msg.createdAt | date:'HH:mm' }}</span>
                    @if (msg.sendingUser?._id === currentUserId()) {
                      <span class="material-symbols-outlined text-xs text-[#53bdeb]">done_all</span>
                    }
                  </div>
                </div>
              </div>
            }

          </div>

          <!-- Message Input Area -->
          <footer class="h-[60px] bg-[#202c33] px-4 flex items-center gap-3 shrink-0 z-10 border-r border-[#222e35]">
            <button class="text-[#aebac1] hover:text-[#00a884] transition-colors"><span class="material-symbols-outlined text-2xl">mood</span></button>
            <button class="text-[#aebac1] hover:text-[#00a884] transition-colors"><span class="material-symbols-outlined text-2xl">add</span></button>
            
            <form (ngSubmit)="sendMessage()" class="flex-grow flex items-center gap-3">
              <input 
                type="text" 
                [(ngModel)]="newMessageText"
                name="messageText"
                autocomplete="off"
                placeholder="הקלד הודעה..." 
                class="bg-[#2a3942] text-sm w-full py-2.5 px-4 rounded-lg outline-none placeholder-[#8696a0]"
              />
              <button 
                type="submit" 
                [disabled]="!newMessageText().trim()" 
                class="w-10 h-10 rounded-full bg-[#00a884] text-[#111b21] hover:bg-[#008f6c] transition-all flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
              >
                <span class="material-symbols-outlined text-xl font-bold">send</span>
              </button>
            </form>
          </footer>

        } @else {
          <!-- Empty Chat View / Placeholder (WhatsApp Style) -->
          <div class="m-auto text-center max-w-md p-8 flex flex-col items-center gap-5 select-none z-10 animate-fade-in">
            <div class="w-32 h-32 rounded-full bg-[#202c33] flex items-center justify-center text-[#00a884]">
              <span class="material-symbols-outlined text-7xl">forum</span>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-200">Nexus Chat Web</h1>
              <p class="text-sm text-[#8696a0] mt-2 leading-relaxed">
                שלח וקבל הודעות בצורה מאובטחת. צור קבוצות חדשות, הוסף חברים והתחל להתכתב עם הצפנה מלאה מקצה לקצה.
              </p>
            </div>
            <div class="mt-8 flex items-center gap-2 text-xs text-[#8696a0] border border-[#222e35] py-2 px-4 rounded-full bg-[#111b21]/40">
              <span class="material-symbols-outlined text-sm">lock</span>
              <span>מוצפן מקצה לקצה.</span>
            </div>
          </div>
        }

      </main>

      <!-- ================= MODALS & SLIDE-INS ================= -->
      
      <!-- 1. Send Friend Request Modal -->
      @if (showAddFriend()) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-[#222e35] border border-[#374248] w-full max-w-md p-6 rounded-2xl shadow-2xl relative animate-scale-up">
            <h3 class="text-xl font-bold text-gray-100 mb-2">שלח בקשת חברות</h3>
            <p class="text-xs text-[#8696a0] mb-5">הקלד את שם המשתמש המדויק של החבר שתרצה לצרף לרשימת הקשרים שלך.</p>
            
            <div class="space-y-4">
              <input 
                type="text" 
                [(ngModel)]="friendRequestUsername"
                placeholder="הקלד שם משתמש" 
                class="w-full bg-[#111b21] border border-[#374248] rounded-xl py-3 px-4 outline-none focus:border-[#00a884] text-sm"
              />
              
              <div class="flex gap-3 justify-end pt-2">
                <button (click)="showAddFriend.set(false)" class="px-4 py-2 text-sm text-[#8696a0] hover:text-white transition-colors">ביטול</button>
                <button (click)="sendFriendRequest()" [disabled]="!friendRequestUsername().trim()" class="bg-[#00a884] text-[#111b21] font-bold px-5 py-2.5 rounded-xl hover:bg-[#008f6c] transition-colors text-sm disabled:opacity-50">שלח בקשה</button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- 2. Accept Friend Request Modal -->
      @if (showAcceptFriend()) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-[#222e35] border border-[#374248] w-full max-w-md p-6 rounded-2xl shadow-2xl relative animate-scale-up">
            <div class="flex justify-between items-center border-b border-[#374248] pb-3 mb-4">
              <h3 class="text-xl font-bold text-gray-100">בקשות חברות ממתינות</h3>
              <button (click)="showAcceptFriend.set(false)" class="text-[#8696a0] hover:text-white"><span class="material-symbols-outlined">close</span></button>
            </div>
            
            <div class="space-y-4">
              <!-- רשימת בקשות חברות ממתינות בצורה חיה -->
              <div class="max-h-56 overflow-y-auto border border-[#374248] rounded-xl bg-[#111b21] p-3 divide-y divide-[#222e35] custom-scrollbar">
                @if (pendingRequests().length === 0) {
                  <div class="p-6 text-center text-[#8696a0] flex flex-col items-center gap-2">
                    <span class="material-symbols-outlined text-4xl opacity-50">mail_outline</span>
                    <p class="text-xs">אין בקשות חברות ממתינות כרגע 📭</p>
                  </div>
                }
                
                @for (req of pendingRequests(); track req._id) {
                  <div class="flex justify-between items-center py-2.5">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-[#2a3942] text-[#00a884] flex items-center justify-center font-bold text-xs shrink-0">
                        {{ req.username.substring(0, 2).toUpperCase() }}
                      </div>
                      <span class="text-sm font-semibold text-gray-200">{{ req.username }}</span>
                    </div>
                    
                    <button 
                      (click)="acceptFriendRequestDirectly(req.username)"
                      class="flex items-center gap-1.5 px-3 py-1.5 bg-[#00a884] text-[#111b21] hover:bg-[#008f6c] text-xs font-bold rounded-lg transition-colors active:scale-95"
                    >
                      <span class="material-symbols-outlined text-sm font-bold">check</span>
                      <span>אשר חברות</span>
                    </button>
                  </div>
                }
              </div>
              
              <div class="flex justify-end pt-2">
                <button (click)="showAcceptFriend.set(false)" class="bg-[#2a3942] text-white px-5 py-2 rounded-xl text-xs hover:bg-[#374248] transition-colors">סגור חלון</button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- 3. Create Group Chat Modal -->
      @if (showCreateGroup()) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-[#222e35] border border-[#374248] w-full max-w-md p-6 rounded-2xl shadow-2xl relative animate-scale-up">
            <h3 class="text-xl font-bold text-gray-100 mb-2">יצירת קבוצה חדשה</h3>
            <p class="text-xs text-[#8696a0] mb-4">בחר את החברים שתרצה לצרף והזן את שם הקבוצה.</p>
            
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-gray-400 mb-1">שם הקבוצה</label>
                <input 
                  type="text" 
                  [(ngModel)]="groupName"
                  placeholder="למשל: צוות מפתחים 💻" 
                  class="w-full bg-[#111b21] border border-[#374248] rounded-xl py-3 px-4 outline-none focus:border-[#00a884] text-sm"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-400 mb-2">בחר חברים (לחץ לסימון/ביטול)</label>
                <div class="max-h-36 overflow-y-auto border border-[#374248] rounded-xl bg-[#111b21] p-2 divide-y divide-[#222e35]">
                  @if (friends().length === 0) {
                    <p class="text-xs text-[#8696a0] p-4 text-center">אין חברים להוספה. הוסף חברים תחילה!</p>
                  }
                  @for (friend of friends(); track friend.username) {
                    <div 
                      (click)="toggleFriendSelectionForGroup(friend.username)"
                      [class.bg-[#00a884]/20]="selectedFriendsForGroup().includes(friend.username)"
                      class="flex justify-between items-center p-2.5 cursor-pointer rounded-lg hover:bg-[#202c33] transition-colors"
                    >
                      <span class="text-sm font-medium">{{ friend.username }}</span>
                      @if (selectedFriendsForGroup().includes(friend.username)) {
                        <span class="material-symbols-outlined text-[#00a884] text-sm">check_circle</span>
                      }
                    </div>
                  }
                </div>
              </div>
              
              <div class="flex gap-3 justify-end pt-2">
                <button (click)="showCreateGroup.set(false)" class="px-4 py-2 text-sm text-[#8696a0] hover:text-white transition-colors">ביטול</button>
                <button (click)="createGroup()" [disabled]="!groupName().trim() || selectedFriendsForGroup().length === 0" class="bg-[#00a884] text-[#111b21] font-bold px-5 py-2.5 rounded-xl hover:bg-[#008f6c] transition-colors text-sm disabled:opacity-50">צור קבוצה</button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- 4. Manage Group Modal (Settings) -->
      @if (showGroupSettings()) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-[#222e35] border border-[#374248] w-full max-w-md p-6 rounded-2xl shadow-2xl relative animate-scale-up">
            <div class="flex justify-between items-center border-b border-[#374248] pb-3 mb-4">
              <h3 class="text-xl font-bold text-gray-100">ניהול קבוצה: {{ activeChat().name }}</h3>
              <button (click)="showGroupSettings.set(false)" class="text-[#8696a0] hover:text-white"><span class="material-symbols-outlined">close</span></button>
            </div>
            
            <div class="space-y-4 overflow-y-auto max-h-[450px] pr-1">
              <!-- Edit Name -->
              <div>
                <label class="block text-xs font-bold text-gray-400 mb-1">עדכן שם קבוצה</label>
                <div class="flex gap-2">
                  <input 
                    type="text" 
                    [(ngModel)]="groupSettingsName"
                    class="flex-grow bg-[#111b21] border border-[#374248] rounded-xl py-2 px-3 text-sm outline-none focus:border-[#00a884]"
                  />
                  <button (click)="updateGroupName()" class="bg-[#00a884] text-[#111b21] px-3.5 rounded-xl font-bold text-xs hover:bg-[#008f6c]">עדכן</button>
                </div>
              </div>

              <!-- Edit Description -->
              <div>
                <label class="block text-xs font-bold text-gray-400 mb-1">עדכן תיאור קבוצה</label>
                <div class="flex gap-2">
                  <input 
                    type="text" 
                    [(ngModel)]="groupSettingsDesc"
                    class="flex-grow bg-[#111b21] border border-[#374248] rounded-xl py-2 px-3 text-sm outline-none focus:border-[#00a884]"
                  />
                  <button (click)="updateGroupDescription()" class="bg-[#00a884] text-[#111b21] px-3.5 rounded-xl font-bold text-xs hover:bg-[#008f6c]">עדכן</button>
                </div>
              </div>

              <!-- Add member -->
              <div>
                <label class="block text-xs font-bold text-gray-400 mb-1">הוסף חבר חדש לקבוצה</label>
                <div class="flex gap-2">
                  <input 
                    type="text" 
                    [(ngModel)]="newGroupMemberUsername"
                    placeholder="הקלד שם משתמש"
                    class="flex-grow bg-[#111b21] border border-[#374248] rounded-xl py-2 px-3 text-sm outline-none focus:border-[#00a884]"
                  />
                  <button (click)="addMemberToGroup()" class="bg-[#00a884] text-[#111b21] px-3.5 rounded-xl font-bold text-xs hover:bg-[#008f6c]">הוסף</button>
                </div>
              </div>

              <!-- Members list for deletion -->
              <div>
                <label class="block text-xs font-bold text-gray-400 mb-2">רשימת חברים נוכחית לקבוצה</label>
                <div class="max-h-40 overflow-y-auto border border-[#374248] rounded-xl bg-[#111b21] p-2 divide-y divide-[#222e35]">
                  @if (groupMembers().length === 0) {
                    <p class="text-xs text-[#8696a0] p-4 text-center animate-pulse">טוען רשימת חברים...</p>
                  }
                  @for (member of groupMembers(); track member._id) {
                    <div class="flex justify-between items-center py-2 px-1">
                      <span class="text-sm font-medium">{{ member.username }} {{ member._id === currentUserId() ? '(אני)' : '' }}</span>
                      @if (member._id !== currentUserId()) {
                        <button (click)="removeMemberFromGroup(member.username)" class="text-red-400 hover:text-red-500 hover:bg-[#202c33] p-1 rounded-full transition-colors" title="הסר מהקבוצה">
                          <span class="material-symbols-outlined text-sm font-bold">delete</span>
                        </button>
                      }
                    </div>
                  }
                </div>
              </div>

            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      width: 100vw;
    }
    
    /* custom styling for scrolls and animation popping */
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: #374248;
      border-radius: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .scale-in {
      animation: scaleIn 0.18s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards;
    }
    
    @keyframes scaleIn {
      0% { opacity: 0; transform: scale(0.9); }
      100% { opacity: 1; transform: scale(1); }
    }

    .animate-scale-up {
      animation: scaleUp 0.25s cubic-bezier(0.1, 0.8, 0.2, 1) forwards;
    }

    @keyframes scaleUp {
      0% { opacity: 0; transform: scale(0.95) translateY(10px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }

    .animate-fade-in {
      animation: fadeIn 0.4s ease forwards;
    }

    @keyframes fadeIn {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
  `]
})
export class ChatComponent implements OnInit {
  private authService = inject(AuthService);
  private chatsService = inject(ChatsService);
  private messagesService = inject(MessagesService);
  private router = inject(Router);

  // 📝 זיהוי המשתמש המחובר כרגע
  currentUserId = signal<string>('');
  currentUsername = signal<string>('');

  // 🗂️ ניהול רשימות
  chats = signal<any[]>([]); // שיחות קבוצתיות ופרטיות ששמורות
  friends = signal<any[]>([]); // רשימת חברים מאושרים
  messages = signal<any[]>([]); // הודעות בצ'אט הפעיל
  groupMembers = signal<any[]>([]); // חברי הקבוצה הפעילה

  // 🔍 חיפוש ופילטרים
  searchQuery = '';
  activeFilter = signal<'all' | 'groups' | 'friends'>('all');

  // 🔄 טעינה
  loadingChats = signal<boolean>(false);
  loadingMessages = signal<boolean>(false);

  // 💬 צ'אט פעיל שנבחר
  activeChat = signal<any>(null);
  newMessageText = signal<string>('');

  // 🚪 מודאלים
  showAddFriend = signal<boolean>(false);
  showAcceptFriend = signal<boolean>(false);
  showCreateGroup = signal<boolean>(false);
  showGroupSettings = signal<boolean>(false);

  // 📝 רשימת בקשות ממתינות
  pendingRequests = signal<any[]>([]);

  // 📝 שדות טופס במודאלים
  friendRequestUsername = signal<string>('');
  acceptRequestUsername = signal<string>('');
  groupName = signal<string>('');
  selectedFriendsForGroup = signal<string[]>([]);
  
  groupSettingsName = signal<string>('');
  groupSettingsDesc = signal<string>('');
  newGroupMemberUsername = signal<string>('');

  constructor() {
    // בכל פעם שנבחר צ'אט חדש, נשלוף אוטומטית את הודעותיו
    effect(() => {
      const chat = this.activeChat();
      if (chat && chat._id) {
        this.loadMessages(chat._id);
        if (chat.type === 'group') {
          this.loadGroupMembers(chat._id);
        }
      }
    });
  }

  ngOnInit() {
    const id = localStorage.getItem('userId');
    const name = localStorage.getItem('username');

    if (!id || !name) {
      // אם אין יוזר שמור ב-localStorage, נחזיר אותו למסך ההתחברות
      this.router.navigate(['/login']);
      return;
    }

    this.currentUserId.set(id);
    this.currentUsername.set(name);

    this.loadFriendsAndGroups();
  }

  // 👥 טעינת רשימת החברים והקבוצות שלי
  loadFriendsAndGroups() {
    this.loadingChats.set(true);
    
    // שליפת חברים
    this.authService.getFriends().subscribe({
      next: (friendsList) => {
        this.friends.set(friendsList);
        
        // נשחזר את הקבוצות השמורות של היוזר מה-localStorage
        const savedChats = localStorage.getItem(`chats_${this.currentUserId()}`);
        const groupChats = savedChats ? JSON.parse(savedChats) : [];
        
        // נחבר את החברים והקבוצות לרשימה אחת משולבת
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

  // 📥 טעינת כל בקשות החברות שממתינות לאישור שלי
  loadPendingRequests() {
    this.authService.getPendingRequests().subscribe({
      next: (reqs) => {
        this.pendingRequests.set(reqs);
      },
      error: () => {
        this.pendingRequests.set([]);
      }
    });
  }

  // 🤝 אישור בקשת חברות ישירות מתוך הרשימה המעודכנת
  acceptFriendRequestDirectly(username: string) {
    this.authService.acceptFriend(username).subscribe({
      next: () => {
        alert(`אשרת את החברות עם ${username} בהצלחה! 🤝`);
        this.loadPendingRequests(); // עדכון רשימת הממתינות
        this.loadFriendsAndGroups(); // עדכון רשימת החברים בצד
      },
      error: (err) => {
        alert(err.error?.message || 'שגיאה באישור החברות.');
      }
    });
  }

  // 📜 סינון השיחות על פי החיפוש והפילטר הנוכחי
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
      // יצירת מזהה שיחה פרטי מדומה על בסיס חיבור ה-ID של שניהם
      const fakeChatId = [this.currentUserId(), item._id || item.username].sort().join('_');
      this.activeChat.set({
        ...item,
        type: 'private',
        _id: fakeChatId
      });
    }
  }

  // 📜 שליפת היסטוריית ההודעות של הצ'אט הפעיל
  loadMessages(chatId: string) {
    this.loadingMessages.set(true);
    this.messagesService.getChatMessages(chatId).subscribe({
      next: (msgList) => {
        this.messages.set(msgList);
        this.loadingMessages.set(false);
      },
      error: () => {
        // בשיחה פרטית חדשה יחזור 404/שגיאה מהמונגו כי אין עדיין מסמך, ננקה את ההודעות
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
        // אם מדובר בשיחה פרטית חדשה, ניצור קבוצה מהירה ברקע
        if (chat.type === 'private') {
          this.chatsService.createGroup(chat.username, [chat.username]).subscribe({
            next: (createdChat) => {
              // נעדכן את ה-id המדומה ל-id האמיתי של השיחה
              chat._id = createdChat._id;
              this.messagesService.sendMessage(createdChat._id, text).subscribe({
                next: (msg) => {
                  this.messages.set([msg]);
                  this.newMessageText.set('');
                  this.saveGroupToLocal(createdChat);
                }
              });
            }
          });
        }
      }
    });
  }

  // 👥 שמירת קבוצה ב-Local Storage כדי שתהיה פרסיסטנטית
  saveGroupToLocal(group: any) {
    const key = `chats_${this.currentUserId()}`;
    const saved = localStorage.getItem(key);
    const list = saved ? JSON.parse(saved) : [];
    
    // מניעת כפילויות
    if (!list.some((c: any) => c._id === group._id)) {
      list.push({ ...group, type: 'group' });
      localStorage.setItem(key, JSON.stringify(list));
      this.chats.set([...list, ...this.friends().map(f => ({ ...f, type: 'private' }))]);
    }
  }

  // 👥 יצירת קבוצה חדשה
  createGroup() {
    const name = this.groupName().trim();
    const members = this.selectedFriendsForGroup();

    if (!name || members.length === 0) return;

    this.chatsService.createGroup(name, members).subscribe({
      next: (createdGroup) => {
        this.saveGroupToLocal(createdGroup);
        this.showCreateGroup.set(false);
        this.groupName.set('');
        this.selectedFriendsForGroup.set([]);
        this.selectConversation(createdGroup);
      },
      error: (err) => {
        alert(err.error?.message || 'שגיאה ביצירת הקבוצה');
      }
    });
  }

  // 👥 טעינת חברי קבוצה מונגואית
  loadGroupMembers(chatId: string) {
    this.chatsService.getGroupMembers(chatId).subscribe({
      next: (members) => {
        this.groupMembers.set(members);
      }
    });
  }

  // ➕ הוספת חבר חדש לקבוצה
  addMemberToGroup() {
    const username = this.newGroupMemberUsername().trim();
    const chat = this.activeChat();
    if (!username || !chat) return;

    this.chatsService.addMemberToGroup(chat._id, username).subscribe({
      next: () => {
        this.loadGroupMembers(chat._id);
        this.newGroupMemberUsername.set('');
        alert(`המשתמש ${username} צורף בהצלחה!`);
      },
      error: (err) => {
        alert(err.error?.message || 'הוספת המשתמש נכשלה');
      }
    });
  }

  // ➖ הסרת חבר מקבוצה
  removeMemberFromGroup(username: string) {
    const chat = this.activeChat();
    if (!chat) return;

    this.chatsService.removeMemberFromGroup(chat._id, username).subscribe({
      next: () => {
        this.loadGroupMembers(chat._id);
        alert(`המשתמש ${username} הוסר מהקבוצה.`);
      },
      error: (err) => {
        alert(err.error?.message || 'הסרת המשתמש נכשלה');
      }
    });
  }

  // ✏️ עדכון שם קבוצה
  updateGroupName() {
    const newName = this.groupSettingsName().trim();
    const chat = this.activeChat();
    if (!newName || !chat) return;

    this.chatsService.updateGroupName(chat._id, newName).subscribe({
      next: (updatedChat) => {
        this.activeChat.set(updatedChat);
        this.saveGroupToLocal(updatedChat);
        alert('שם הקבוצה עודכן בהצלחה!');
      }
    });
  }

  // 📝 עדכון תיאור קבוצה
  updateGroupDescription() {
    const desc = this.groupSettingsDesc().trim();
    const chat = this.activeChat();
    if (!chat) return;

    this.chatsService.updateGroupDescription(chat._id, desc).subscribe({
      next: (updatedChat) => {
        this.activeChat.set(updatedChat);
        this.saveGroupToLocal(updatedChat);
        alert('תיאור הקבוצה עודכן בהצלחה!');
      }
    });
  }

  // 👥 שליחת בקשת חברות
  sendFriendRequest() {
    const username = this.friendRequestUsername().trim();
    if (!username) return;

    this.authService.sendFriendRequest(username).subscribe({
      next: () => {
        this.showAddFriend.set(false);
        this.friendRequestUsername.set('');
        alert(`בקשת חברות נשלחה בהצלחה ל-${username}! 🎉`);
      },
      error: (err) => {
        alert(err.error?.message || 'משתמש לא נמצא או שכבר קיימת בקשה איתו.');
      }
    });
  }

  // 🤝 אישור בקשת חברות
  acceptFriendRequest() {
    const username = this.acceptRequestUsername().trim();
    if (!username) return;

    this.authService.acceptFriend(username).subscribe({
      next: () => {
        this.showAcceptFriend.set(false);
        this.acceptRequestUsername.set('');
        alert(`אשרת את החברות עם ${username} בהצלחה! 🤝`);
        this.loadFriendsAndGroups(); // רענון רשימת חברים
      },
      error: (err) => {
        alert(err.error?.message || 'לא נמצאה בקשת חברות ממתינה מהמשתמש הזה.');
      }
    });
  }

  // ❌ מחיקת חבר קיים
  deleteFriend(event: Event, username: string) {
    event.stopPropagation(); // מונע פתיחה של השיחה בלחיצה על מחיקה
    
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

  // 🚪 ניהול פתיחת מודאלים
openAddFriendModal() { this.showAddFriend.set(true); }
  
  openAcceptFriendModal() { 
    this.showAcceptFriend.set(true); 
    this.loadPendingRequests(); // טוען את בקשות החברות מיד בפתיחה!
  }
  
  openCreateGroupModal() { this.showCreateGroup.set(true); }
  
  openGroupSettingsModal() { 
    this.showGroupSettings.set(true); 
    this.groupSettingsName.set(this.activeChat().name || '');
    this.groupSettingsDesc.set(this.activeChat().description || '');
  }

  toggleFriendSelectionForGroup(username: string) {
    this.selectedFriendsForGroup.update(list => {
      if (list.includes(username)) {
        return list.filter(u => u !== username);
      } else {
        return [...list, username];
      }
    });
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
