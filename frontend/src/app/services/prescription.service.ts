import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8080/api/prescriptions';

export interface PrescriptionItem {
    id?: number;
    medicationName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
}

export interface Prescription {
    id?: number;
    patientId: number;
    doctorName?: string;
    patientName?: string;
    items: PrescriptionItem[];
    status?: string;
    filePath?: string;
    issueDate?: string;
    expiryDate?: string;
    renewalPeriod?: number;
    maxRenewals?: number;
    renewalCount?: number;
    version?: number;
    isDispensed?: boolean;
    dispensedAt?: string;
    pharmacistId?: number;
    // UI helper fields
    patient?: any;
    doctor?: any;
}

@Injectable({
    providedIn: 'root'
})
export class PrescriptionService {

    constructor(private http: HttpClient) { }

    createPrescription(prescription: Prescription, file?: File): Observable<any> {
        const formData = new FormData();
        formData.append('prescription', new Blob([JSON.stringify(prescription)], {
            type: 'application/json'
        }));

        if (file) {
            formData.append('file', file);
        }

        const token = sessionStorage.getItem('auth-token');
        const headers: any = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return this.http.post(API_URL, formData, { headers });
    }

    getPrescriptions(): Observable<Prescription[]> {
        return this.http.get<Prescription[]>(API_URL);
    }

    updatePrescription(id: number, prescription: Prescription): Observable<any> {
        return this.http.put(`${API_URL}/${id}`, prescription);
    }

    updateStatus(id: number, status: string): Observable<any> {
        return this.http.put(`${API_URL}/${id}/status`, JSON.stringify(status), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    renewPrescription(id: number): Observable<any> {
        return this.http.put(`${API_URL}/${id}/renew`, {});
    }

    dispensePrescription(id: number): Observable<any> {
        return this.http.put(`${API_URL}/${id}/dispense`, {});
    }

    getHistory(id: number): Observable<any[]> {
        return this.http.get<any[]>(`${API_URL}/${id}/history`);
    }
}
