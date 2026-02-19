import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PrescriptionService } from '../../services/prescription.service';
import { NotificationCenterComponent } from './components/notification-center.component';

@Component({
    selector: 'app-patient',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, NotificationCenterComponent],
    templateUrl: './patient.html',
})
export class Patient implements OnInit {
    user: any;
    profile: any = {};

    activeCount = 0;
    expiredCount = 0;

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
            this.activeCount = data.filter(p => p.status === 'APPROVED' || p.status === 'RENEWED').length;
            this.expiredCount = data.filter(p => p.status === 'EXPIRED').length;
        });
    }

    logout() {
        sessionStorage.clear();
        this.router.navigate(['/login']);
    }
}
