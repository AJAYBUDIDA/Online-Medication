import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrescriptionService } from '../../../services/prescription.service'; // Ensure correct path

@Component({
    selector: 'app-patient-prescription',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="min-h-screen bg-slate-50 p-6 md:p-10">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold text-blue-800 mb-8 flex items-center gap-2">
            <span>💊</span> My Prescriptions
        </h1>

        <!-- Tabs -->
        <div class="flex border-b border-gray-200 mb-6">
            <button (click)="activeTab = 'active'" [ngClass]="{'border-blue-500 text-blue-600': activeTab === 'active', 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== 'active'}" class="py-4 px-6 border-b-2 font-medium text-sm focus:outline-none transition-colors">
                Active Medications
            </button>
            <button (click)="activeTab = 'history'" [ngClass]="{'border-blue-500 text-blue-600': activeTab === 'history', 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== 'history'}" class="py-4 px-6 border-b-2 font-medium text-sm focus:outline-none transition-colors">
                Prescription History
            </button>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Issued</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medications</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr *ngFor="let p of filteredPrescriptions" class="hover:bg-gray-50 transition-colors">
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{p.issueDate | date:'mediumDate'}}</td>
                            <td class="px-6 py-4">
                                <div class="space-y-2">
                                     <div *ngFor="let item of p.items" class="text-sm border-b pb-1 last:border-0 border-gray-100">
                                        <div class="font-bold text-gray-900">{{item.medicationName}}</div>
                                        <div class="text-xs text-gray-500">{{item.dosage}} | {{item.duration}}</div>
                                        <div class="text-xs text-gray-500 italic" *ngIf="item.instructions">"{{item.instructions}}"</div>
                                     </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Dr. {{p.doctor?.user?.username || p.doctorName}}</td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                                    [ngClass]="{
                                        'bg-yellow-100 text-yellow-800': p.status === 'PENDING' || p.status === 'PENDING_APPROVAL',
                                        'bg-green-100 text-green-800': p.status === 'APPROVED' || p.status === 'RENEWED',
                                        'bg-red-100 text-red-800': p.status === 'REJECTED' || p.status === 'EXPIRED',
                                        'bg-blue-100 text-blue-800': p.status === 'DRAFT'
                                    }">
                                    {{p.status}}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {{p.expiryDate ? (p.expiryDate | date:'shortDate') : 'N/A'}}
                                <span *ngIf="isExpiringSoon(p.expiryDate)" class="text-red-500 text-xs font-bold block">Expiring Soon</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <button *ngIf="p.filePath" (click)="download(p.filePath)" class="text-blue-600 hover:text-blue-900 mr-3 inline-flex items-center gap-1 font-medium">
                                    📄 Download
                                </button>
                                <button *ngIf="p.status === 'APPROVED' || p.status === 'RENEWED'" class="text-green-600 hover:text-green-900 text-xs font-medium inline-flex items-center gap-1 bg-green-50 px-2 py-1 rounded border border-green-200 hover:bg-green-100 transition-colors">
                                    🔄 Refill
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div *ngIf="filteredPrescriptions.length === 0" class="text-center py-12 text-gray-500">
                    No {{activeTab === 'active' ? 'active' : 'past'}} prescriptions found.
                </div>
            </div>
        </div>
      </div>
    </div>
  `
})
export class PatientPrescriptionComponent implements OnInit {
    allPrescriptions: any[] = [];
    activeTab: 'active' | 'history' = 'active';

    constructor(private prescriptionService: PrescriptionService) { }

    ngOnInit() {
        this.prescriptionService.getPrescriptions().subscribe(data => {
            this.allPrescriptions = data;
        });
    }

    get filteredPrescriptions() {
        if (this.activeTab === 'active') {
            return this.allPrescriptions.filter(p => p.status === 'APPROVED' || p.status === 'RENEWED' || p.status === 'PENDING_APPROVAL');
        } else {
            return this.allPrescriptions.filter(p => p.status === 'EXPIRED' || p.status === 'REJECTED' || p.status === 'DISPENSED'); // Add DISPENSED if applicable
        }
    }

    isExpiringSoon(expiryDate: string): boolean {
        if (!expiryDate) return false;
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays >= 0;
    }

    download(filename: string) {
        window.open(`http://localhost:8080/api/prescriptions/download/${filename}`, '_blank');
    }
}
