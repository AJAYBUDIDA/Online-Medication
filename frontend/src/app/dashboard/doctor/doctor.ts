import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PrescriptionService } from '../../services/prescription.service';

@Component({
    selector: 'app-doctor',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './doctor.html',
})
export class Doctor implements OnInit {
    user: any;
    profile: any = {};

    issuedCount = 0;
    pendingCount = 0;
    activeCount = 0;

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
            this.issuedCount = data.length;
            this.pendingCount = data.filter(p => p.status === 'PENDING' || p.status === 'PENDING_APPROVAL').length;
            this.activeCount = data.filter(p => p.status === 'APPROVED' || p.status === 'RENEWED').length;
        });
    }

    logout() {
        sessionStorage.clear();
        this.router.navigate(['/login']);
    }
}
