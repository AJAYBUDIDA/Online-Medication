import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8080/api/reminders';

export interface MedicationReminder {
    id?: number;
    medicationName: string;
    dosage: string;
    reminderTime: string; // HH:mm format
    frequency: string;
    days?: string;
    active: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ReminderService {
    constructor(private http: HttpClient) { }

    createReminder(reminder: MedicationReminder): Observable<MedicationReminder> {
        return this.http.post<MedicationReminder>(API_URL, reminder);
    }

    getMyReminders(): Observable<MedicationReminder[]> {
        return this.http.get<MedicationReminder[]>(API_URL);
    }

    deleteReminder(id: number): Observable<any> {
        return this.http.delete(`${API_URL}/${id}`);
    }

    toggleReminder(id: number): Observable<MedicationReminder> {
        return this.http.put<MedicationReminder>(`${API_URL}/${id}/toggle`, {});
    }
}
