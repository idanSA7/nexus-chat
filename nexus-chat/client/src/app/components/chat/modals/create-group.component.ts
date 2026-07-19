import { Component, inject, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatsService } from '../../../services/chats';

@Component({
  selector: 'app-create-group-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl w-full max-w-[480px] p-6 shadow-2xl border-t-4 border-[#00a884] animate-fade-in">
        
        <!-- כותרת -->
        <div class="flex justify-between items-center mb-6 border-b pb-3">
          <h3 class="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span class="material-symbols-outlined text-[#00a884]">group_add</span>
            יצירת קבוצה חדשה
          </h3>
          <button (click)="close.emit()" class="text-gray-400 hover:text-gray-600 transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="space-y-4">
          <!-- שם הקבוצה -->
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">שם הקבוצה</label>
            <input 
              type="text" 
              [(ngModel)]="groupName"
              class="w-full px-4 py-2.5 bg-[#f8f9fa] border border-gray-200 rounded-xl focus:border-[#00a884] focus:bg-white focus:ring-2 focus:ring-[#00a884]/20 transition-all outline-none text-gray-700 font-medium"
              placeholder="לדוגמה: צוות פיתוח 💻"
            />
          </div>

          <!-- בחירת חברים לקבוצה -->
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              בחר חברים (נבחרו: {{ selectedFriends().length }})
            </label>
            
            <div class="max-h-[180px] overflow-y-auto space-y-1.5 border rounded-xl p-2 bg-[#f8f9fa]">
              @for (friend of friends(); track friend._id) {
                <label 
                  class="flex items-center justify-between p-2 hover:bg-white rounded-lg cursor-pointer transition-colors border border-transparent hover:border-gray-100"
                >
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-[#00a884]/15 text-[#00a884] flex items-center justify-center font-bold text-xs">
                      {{ friend.username?.substring(0, 2).toUpperCase() }}
                    </div>
                    <span class="text-sm font-semibold text-gray-700">{{ friend.username }}</span>
                  </div>
                  <input 
                    type="checkbox" 
                    [checked]="selectedFriends().includes(friend.username)"
                    (change)="toggleFriend(friend.username)"
                    class="w-4 h-4 rounded text-[#00a884] focus:ring-[#00a884]"
                  />
                </label>
              } @empty {
                <p class="text-xs text-gray-400 text-center py-4">אין חברים ברשימה. הוסף חברים תחילה!</p>
              }
            </div>
          </div>

          <!-- כפתורי שליחה -->
          <div class="flex gap-2 pt-2">
            <button 
              (click)="submitGroup()"
              [disabled]="!groupName().trim() || selectedFriends().length === 0"
              class="flex-grow bg-[#00a884] text-white font-bold py-3 px-4 rounded-xl hover:bg-[#008f6c] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center gap-1"
            >
              <span class="material-symbols-outlined text-lg">check</span>
              <span>צור קבוצה עכשיו</span>
            </button>
            <button 
              (click)="close.emit()"
              class="bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-200 transition-all text-sm"
            >
              ביטול
            </button>
          </div>

        </div>

      </div>
    </div>
  `
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