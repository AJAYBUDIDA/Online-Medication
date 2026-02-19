import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PrescriptionService } from '../../services/prescription.service';

@Component({
    selector: 'app-pharmacist',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './pharmacist.html',
})
export class Pharmacist implements OnInit {
    user: any;
    profile: any = {};

    pendingCount = 0;
    todayCount = 0;

    constructor(private router: Router, private http: HttpClient, private prescriptionService: PrescriptionService) {
        this.user = JSON.parse(sessionStorage.getItem('auth-user') || '{}');
    }

    ngOnInit(): void {
        const token = sessionStorage.getItem('auth-token');
        this.http.get('http://localhost:8080/api/profile/me', {
            headers: { Authorization: `Bearer ${token}` }
        }).subscribe({
            next: (data) => {
                this.profile = data;
            },
            error: (err) => {
                console.error(err);
                if (err.status === 401) this.logout();
            }
        });

        this.loadStats();
    }

    loadStats() {
        this.prescriptionService.getPrescriptions().subscribe(data => {
            this.pendingCount = data.filter(p => p.status === 'PENDING' || p.status === 'PENDING_APPROVAL').length;
            // Rough 'today' check - requires parsed date
            const today = new Date().toISOString().split('T')[0];
            this.todayCount = data.filter(p => p.issueDate === today).length;
        });
    }

    logout() {
        sessionStorage.clear();
        this.router.navigate(['/login']);
    }
}
