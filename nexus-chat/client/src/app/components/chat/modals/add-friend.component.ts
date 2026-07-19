import { Component, inject, signal, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-add-friend-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl w-full max-w-[480px] p-6 shadow-2xl border-t-4 border-[#00a884] animate-fade-in">
        
        <!-- כותרת המודאל -->
        <div class="flex justify-between items-center mb-6 border-b pb-3">
          <h3 class="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span class="material-symbols-outlined text-[#00a884]">person_add</span>
            הוספת חבר חדש
          </h3>
          <button (click)="close.emit()" class="text-gray-400 hover:text-gray-600 transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- טופס שליחת בקשה חדשה -->
        <div class="space-y-4 mb-6">
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider">חפש שם משתמש</label>
          <div class="flex gap-2">
            <input 
              type="text" 
              [(ngModel)]="friendRequestUsername"
              class="flex-grow px-4 py-2.5 bg-[#f8f9fa] border border-gray-200 rounded-xl focus:border-[#00a884] focus:bg-white focus:ring-2 focus:ring-[#00a884]/20 transition-all outline-none text-gray-700 font-medium"
              placeholder="הקלד שם משתמש מדויק"
            />
            <button 
              (click)="sendFriendRequest()"
              [disabled]="!friendRequestUsername().trim()"
              class="bg-[#00a884] text-white font-bold px-4 py-2.5 rounded-xl hover:bg-[#008f6c] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
            >
              <span>שלח</span>
              <span class="material-symbols-outlined text-sm">send</span>
            </button>
          </div>
        </div>

        <!-- רשימת בקשות חברות ממתינות (לאישור שלי) -->
        <div class="border-t pt-4">
          <h4 class="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-amber-500">pending_actions</span>
            בקשות חברות ממתינות לאישור שלך ({{ pendingRequests().length }})
          </h4>

          @if (pendingRequests().length === 0) {
            <p class="text-xs text-gray-400 py-3 text-center">אין בקשות חברות ממתינות כרגע.</p>
          } @else {
            <div class="max-h-[180px] overflow-y-auto space-y-2 pr-1">
              @for (req of pendingRequests(); track req._id) {
                <div class="flex justify-between items-center bg-[#f8f9fa] p-3 rounded-xl border border-gray-100">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-[#00a884]/10 text-[#00a884] flex items-center justify-center font-bold text-xs">
                      {{ req.sendingUser?.username?.substring(0, 2).toUpperCase() }}
                    </div>
                    <span class="text-sm font-semibold text-gray-700">{{ req.sendingUser?.username }}</span>
                  </div>
                  <button 
                    (click)="acceptFriendRequestDirectly(req.sendingUser?.username)"
                    class="bg-[#e6f7f4] text-[#00a884] hover:bg-[#00a884] hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <span class="material-symbols-outlined text-sm">done</span>
                    <span>אשר</span>
                  </button>
                </div>
              }
            </div>
          }
        </div>

      </div>
    </div>
  `
})
export class AddFriendComponent implements OnInit {
  private authService = inject(AuthService);

  friendRequestUsername = signal<string>('');
  pendingRequests = signal<any[]>([]);

  close = output<void>();
  friendAdded = output<void>(); // מאותת לצ'אט הראשי לרענן את רשימת החברים

  ngOnInit() {
    this.loadPendingRequests();
  }

  loadPendingRequests() {
    this.authService.getPendingRequests().subscribe({
      next: (reqs) => this.pendingRequests.set(reqs),
      error: () => this.pendingRequests.set([])
    });
  }

  sendFriendRequest() {
    const username = this.friendRequestUsername().trim();
    if (!username) return;

    this.authService.sendFriendRequest(username).subscribe({
      next: () => {
        this.friendRequestUsername.set('');
        alert(`בקשת חברות נשלחה בהצלחה ל-${username}! 🎉`);
        this.loadPendingRequests();
      },
      error: (err) => {
        alert(err.error?.message || 'משתמש לא נמצא או שכבר קיימת בקשה איתו.');
      }
    });
  }

  acceptFriendRequestDirectly(username: string) {
    if (!username) return;
    this.authService.acceptFriend(username).subscribe({
      next: () => {
        alert(`אשרת את החברות עם ${username} בהצלחה! 🤝`);
        this.loadPendingRequests();
        this.friendAdded.emit(); // מאותת לאבא לרענן
      },
      error: (err) => {
        alert(err.error?.message || 'שגיאה באישור החברות.');
      }
    });
  }
}