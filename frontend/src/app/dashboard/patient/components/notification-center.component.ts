import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../../services/notification.service';

@Component({
    selector: 'app-notification-center',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="relative">
      <button (click)="toggleDropdown()" class="p-2 text-gray-400 hover:text-gray-600 relative">
        🔔
        <span *ngIf="unreadCount > 0" class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">{{unreadCount}}</span>
      </button>

      <div *ngIf="isOpen" class="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20 border border-gray-200">
        <div class="py-2">
            <h3 class="px-4 py-2 text-sm font-bold text-gray-700 border-b bg-gray-50">Notifications</h3>
            <div class="max-h-64 overflow-y-auto">
                <div *ngFor="let n of notifications" class="px-4 py-3 border-b hover:bg-gray-50 transition-colors" [ngClass]="{'bg-blue-50': !n.read}">
                    <p class="text-sm text-gray-800">{{n.message}}</p>
                    <div class="flex justify-between items-center mt-1">
                        <span class="text-xs text-gray-500">{{n.createdAt | date:'short'}}</span>
                        <button *ngIf="!n.read" (click)="markAsRead(n.id)" class="text-xs text-blue-600 hover:text-blue-800 font-medium">Mark read</button>
                    </div>
                </div>
                <div *ngIf="notifications.length === 0" class="px-4 py-3 text-sm text-gray-500 text-center">
                    No notifications.
                </div>
            </div>
        </div>
      </div>
    </div>
  `
})
export class NotificationCenterComponent implements OnInit {
    notifications: Notification[] = [];
    unreadCount = 0;
    isOpen = false;

    constructor(private notificationService: NotificationService) { }

    ngOnInit() {
        this.loadNotifications();
        // Poll every 30 seconds
        setInterval(() => this.loadNotifications(), 30000);
    }

    loadNotifications() {
        this.notificationService.getUserNotifications().subscribe(data => {
            this.notifications = data;
            this.unreadCount = data.filter(n => !n.read).length;
        });
    }

    toggleDropdown() {
        this.isOpen = !this.isOpen;
    }

    markAsRead(id: number) {
        this.notificationService.markAsRead(id).subscribe(() => {
            this.loadNotifications();
        });
    }
}
