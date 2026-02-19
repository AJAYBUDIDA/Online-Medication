import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8080/api/notifications';

export interface Notification {
    id: number;
    message: string;
    read: boolean;
    createdAt: string;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    constructor(private http: HttpClient) { }

    getUserNotifications(): Observable<Notification[]> {
        return this.http.get<Notification[]>(API_URL);
    }

    markAsRead(id: number): Observable<any> {
        return this.http.put(`${API_URL}/${id}/read`, {});
    }
}
