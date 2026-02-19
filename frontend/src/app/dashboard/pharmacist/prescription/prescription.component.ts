import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrescriptionService } from '../../../services/prescription.service'; // Ensure correct path

@Component({
    selector: 'app-pharmacist-prescription',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="min-h-screen bg-slate-50 p-8">
      <div class="max-w-6xl mx-auto">
        <h1 class="text-3xl font-bold text-orange-800 mb-8 flex items-center gap-2">
            <span>⚕️</span> Prescription Validations
        </h1>

        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 border-t-4 border-t-orange-500">
            <h2 class="text-xl font-bold mb-4 text-gray-800">Pending Approvals</h2>
            
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication/Details</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr *ngFor="let p of prescriptions">
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{p.issueDate}}</td>
                            <td class="px-6 py-4">
                                <div class="space-y-2">
                                     <div *ngFor="let item of p.items" class="text-sm border-b pb-1 last:border-0 border-gray-100">
                                        <div class="font-bold text-gray-900">{{item.medicationName}}</div>
                                        <div class="text-xs text-gray-700">{{item.dosage}}</div>
                                        <div class="text-xs text-gray-500">{{item.duration}} | {{item.instructions}}</div>
                                     </div>
                                </div>
                                <button *ngIf="p.filePath" (click)="download(p.filePath)" class="text-blue-600 hover:text-blue-900 text-xs mt-2 font-bold">📄 View PDF</button>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Dr. {{p.doctor?.user?.username || p.doctorName}}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{p.patient?.user?.username || p.patientName}}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <button *ngIf="p.status === 'PENDING' || p.status === 'PENDING_APPROVAL'" (click)="approve(p.id)" class="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-md font-bold mr-2 transition-colors">Approve</button>
                                <button *ngIf="p.status === 'PENDING' || p.status === 'PENDING_APPROVAL'" (click)="reject(p.id)" class="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-md font-bold transition-colors">Reject</button>
                                <button *ngIf="p.status === 'APPROVED' || p.status === 'RENEWED'" (click)="dispense(p.id)" class="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-md font-bold transition-colors">Dispense</button>
                                <span *ngIf="p.isDispensed" class="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">Dispensed</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
                 <div *ngIf="prescriptions.length === 0" class="text-center py-8 text-gray-500">
                    No pending prescriptions.
                </div>
            </div>
        </div>
      </div>
    </div>
  `
})
export class PharmacistPrescriptionComponent implements OnInit {
    prescriptions: any[] = [];

    constructor(private prescriptionService: PrescriptionService) { }

    ngOnInit() {
        this.loadPrescriptions();
    }

    loadPrescriptions() {
        this.prescriptionService.getPrescriptions().subscribe(data => {
            this.prescriptions = data;
        });
    }

    approve(id: number) {
        if (confirm('Are you sure you want to approve this prescription?')) {
            this.prescriptionService.updateStatus(id, 'APPROVED').subscribe(() => {
                this.loadPrescriptions();
                alert('Prescription Approved');
            });
        }
    }

    reject(id: number) {
        if (confirm('Are you sure you want to reject this prescription?')) {
            this.prescriptionService.updateStatus(id, 'REJECTED').subscribe(() => {
                this.loadPrescriptions();
                alert('Prescription Rejected');
            });
        }
    }

    dispense(id: number) {
        if (confirm('Mark this prescription as DISPENSED?')) {
            this.prescriptionService.dispensePrescription(id).subscribe(() => {
                this.loadPrescriptions();
                alert('Prescription marked as Dispensed');
            });
        }
    }

    download(filename: string) {
        window.open(`http://localhost:8080/api/prescriptions/download/${filename}`, '_blank');
    }
}
