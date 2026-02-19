import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { PrescriptionService, Prescription } from '../../../services/prescription.service';

@Component({
    selector: 'app-doctor-prescription',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    template: `
    <div class="min-h-screen bg-slate-50 p-8">
      <div class="max-w-6xl mx-auto">
        <h1 class="text-3xl font-bold text-emerald-800 mb-8 flex items-center gap-2">
            <span>💊</span> Prescription Management
        </h1>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Create/Edit Prescription Form -->
            <div class="lg:col-span-1">
                <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 border-t-4 border-t-emerald-600">
                    <h2 class="text-xl font-bold mb-4 text-gray-800">{{ editingId ? 'Edit Prescription' : 'Issue New Prescription' }}</h2>
                    
                    <!-- Mode Toggle -->
                    <div class="flex p-1 bg-gray-100 rounded-md mb-4" *ngIf="!editingId">
                        <button type="button" (click)="setMode('FORM')" 
                                [class.bg-white]="prescriptionMode === 'FORM'" [class.shadow-sm]="prescriptionMode === 'FORM'"
                                class="flex-1 py-1.5 text-sm font-bold rounded text-gray-700 transition-all">
                                📝 Digital Form
                        </button>
                        <button type="button" (click)="setMode('PDF')" 
                                [class.bg-white]="prescriptionMode === 'PDF'" [class.shadow-sm]="prescriptionMode === 'PDF'"
                                class="flex-1 py-1.5 text-sm font-bold rounded text-gray-700 transition-all">
                                📄 PDF Upload
                        </button>
                    </div>

                    <form [formGroup]="prescriptionForm" (ngSubmit)="onSubmit()">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Patient ID <span class="text-red-500">*</span></label>
                                <input type="number" formControlName="patientId" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2 border">
                            </div>

                            <!-- Medication Items (FORM MODE) -->
                            <div formArrayName="items" class="space-y-4" *ngIf="prescriptionMode === 'FORM'">
                                <div *ngFor="let item of items.controls; let i=index" [formGroupName]="i" class="p-3 bg-gray-50 rounded-md border border-gray-200 relative">
                                    <h3 class="text-xs font-bold text-gray-500 uppercase mb-2">Medication #{{i+1}}</h3>
                                    <button *ngIf="items.length > 1" type="button" (click)="removeItem(i)" class="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs font-bold">✕</button>
                                    
                                    <div class="space-y-2">
                                        <div>
                                            <input type="text" formControlName="medicationName" placeholder="Medication Name" class="block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm">
                                        </div>
                                        <div class="grid grid-cols-2 gap-2">
                                            <input type="text" formControlName="dosage" placeholder="Dosage" class="block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm">
                                            <input type="text" formControlName="duration" placeholder="Duration" class="block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm">
                                        </div>
                                        <div class="grid grid-cols-2 gap-2">
                                            <input type="text" formControlName="frequency" placeholder="Frequency" class="block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm">
                                            <input type="text" formControlName="instructions" placeholder="Instructions" class="block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm">
                                        </div>
                                    </div>
                                </div>
                                <button type="button" (click)="addItem()" class="w-full py-2 border-2 border-dashed border-emerald-300 text-emerald-600 rounded-md hover:bg-emerald-50 font-bold text-sm">
                                    + Add Another Medication
                                </button>
                            </div>

                            <!-- PDF Upload Mode Info -->
                            <div *ngIf="prescriptionMode === 'PDF'" class="p-4 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 text-sm">
                                <p class="font-bold mb-1">Upload a Prescription PDF</p>
                                <p>You can upload a signed or digital prescription file directly. The system will create a record referring to the attached document.</p>
                            </div>
                            
                            <!-- Renewal Section (Only for Form Mode usually, but let's keep optional for both) -->
                            <div class="pt-4 border-t border-gray-100">
                                <h3 class="text-sm font-bold text-emerald-700 mb-2">Renewal Settings (Optional)</h3>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-xs font-medium text-gray-500 uppercase">Renewal Period (Days)</label>
                                        <input type="number" formControlName="renewalPeriod" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-medium text-gray-500 uppercase">Max Renewals</label>
                                        <input type="number" formControlName="maxRenewals" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                                    </div>
                                </div>
                            </div>

                            <!-- File Upload (Visible if PDF Mode OR Form Mode optional attachment) -->
                            <div class="mt-4" *ngIf="prescriptionMode === 'PDF' || (!editingId && prescriptionMode === 'FORM')">
                                <label class="block text-sm font-medium text-gray-700">
                                    {{ prescriptionMode === 'PDF' ? 'Upload Prescription PDF *' : 'Attachment (Optional)' }}
                                </label>
                                <input type="file" (change)="onFileSelected($event)" accept=".pdf" class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100">
                            </div>

                            <div class="flex gap-2 mt-4">
                                <button type="submit" class="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 font-bold shadow-md transition-all">
                                    {{ editingId ? 'Update' : (prescriptionMode === 'PDF' ? 'Upload Prescription' : 'Issue Prescription') }}
                                </button>
                                <button *ngIf="editingId" type="button" (click)="cancelEdit()" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-bold">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <!-- List Prescriptions -->
            <div class="lg:col-span-2">
                <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 class="text-xl font-bold mb-4 text-gray-800">Issued Prescriptions</h2>
                    
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medications</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient ID</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <tr *ngFor="let p of prescriptions">
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{{p.id}}</td>
                                    <td class="px-6 py-4">
                                        <div class="space-y-1">
                                            <div *ngFor="let item of p.items" class="text-sm">
                                                <span class="font-medium text-gray-900">{{item.medicationName}}</span>
                                                <span class="text-xs text-gray-500 ml-1">({{item.dosage}})</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{p.patient?.id || p.patientId}}</td>
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
                                        <div class="flex gap-2 flex-wrap">
                                            <button *ngIf="p.filePath" (click)="download(p.filePath!)" class="text-emerald-600 hover:text-emerald-900 text-xs">📄 PDF</button>
                                            <button (click)="edit(p)" class="text-blue-600 hover:text-blue-900 text-xs font-bold">✏️ Edit</button>
                                            <button *ngIf="p.status === 'APPROVED' || p.status === 'RENEWED'" (click)="renew(p.id!)" class="text-green-600 hover:text-green-900 text-xs">🔄 Renew</button>
                                            <button (click)="viewHistory(p.id!)" class="text-gray-600 hover:text-gray-900 text-xs">🕒 History</button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- History Modal -->
                 <div *ngIf="selectedHistory" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div class="bg-white rounded-lg p-6 max-w-lg w-full">
                        <h3 class="text-lg font-bold mb-4">Audit History</h3>
                        <div class="max-h-60 overflow-y-auto space-y-3">
                            <div *ngFor="let h of selectedHistory" class="border-b pb-2 last:border-0">
                                <p class="text-sm font-bold">{{h.action}} <span class="text-gray-400 font-normal text-xs ml-2">{{h.changeDate | date:'medium'}}</span></p>
                                <p class="text-xs text-gray-600">{{h.changeReason}} (by {{h.changedBy}})</p>
                            </div>
                            <div *ngIf="selectedHistory.length === 0" class="text-center text-gray-500">No history found.</div>
                        </div>
                        <button (click)="selectedHistory = null" class="mt-4 w-full bg-gray-200 py-2 rounded-md font-bold hover:bg-gray-300 transition-colors">Close</button>
                    </div>
                 </div>

            </div>
        </div>
      </div>
    </div>
  `
})
export class DoctorPrescriptionComponent implements OnInit {
    prescriptions: Prescription[] = [];
    prescriptionForm: FormGroup;
    selectedFile: File | null = null;
    selectedHistory: any[] | null = null;
    editingId: number | null = null;
    prescriptionMode: 'FORM' | 'PDF' = 'FORM';

    constructor(private fb: FormBuilder, private prescriptionService: PrescriptionService) {
        this.prescriptionForm = this.fb.group({
            patientId: ['', Validators.required],
            items: this.fb.array([]), // Validators handled dynamically based on mode
            renewalPeriod: [''],
            maxRenewals: ['']
        });
        this.addItem();
    }

    get items() {
        return this.prescriptionForm.get('items') as FormArray;
    }

    setMode(mode: 'FORM' | 'PDF') {
        this.prescriptionMode = mode;
        if (mode === 'PDF') {
            // In PDF mode, we don't strictly require items visible to user,
            // but backend needs one. We'll handle this on submit.
            // Clear items to avoid confusion if they switch back and forth
            this.items.clear();
        } else {
            if (this.items.length === 0) this.addItem();
        }
    }

    addItem(data?: any) {
        const itemForm = this.fb.group({
            medicationName: [data?.medicationName || '', Validators.required],
            dosage: [data?.dosage || '', Validators.required],
            frequency: [data?.frequency || ''],
            duration: [data?.duration || '', Validators.required],
            instructions: [data?.instructions || '']
        });
        this.items.push(itemForm);
    }

    removeItem(index: number) {
        this.items.removeAt(index);
    }

    ngOnInit() {
        this.loadPrescriptions();
    }

    loadPrescriptions() {
        this.prescriptionService.getPrescriptions().subscribe(data => {
            this.prescriptions = data;
        });
    }

    onFileSelected(event: any) {
        this.selectedFile = event.target.files[0];
    }

    edit(prescription: Prescription) {
        this.editingId = prescription.id!;
        this.prescriptionMode = 'FORM'; // Default to form for editing
        this.prescriptionForm.patchValue({
            patientId: prescription.patient?.id || prescription.patientId,
            renewalPeriod: prescription.renewalPeriod,
            maxRenewals: prescription.maxRenewals
        });

        this.items.clear();
        if (prescription.items && prescription.items.length > 0) {
            prescription.items.forEach(item => this.addItem(item));
        } else {
            // If it was a PDF upload, it might have the dummy item. 
            // We can check if existing items look like dummy ones and switch mode if needed?
            // For now, let's just load what's there.
            this.addItem();
        }

        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    cancelEdit() {
        this.editingId = null;
        this.prescriptionForm.reset();
        this.items.clear();
        this.setMode('FORM');
        this.selectedFile = null;
    }

    onSubmit() {
        if (this.prescriptionMode === 'PDF') {
            if (!this.selectedFile) {
                alert('Please upload a PDF file.');
                return;
            }
            // Add dummy item for backend validation
            this.items.clear();
            this.addItem({
                medicationName: 'Prescription PDF Attached',
                dosage: 'N/A',
                frequency: 'N/A',
                duration: 'N/A',
                instructions: 'Refer to attached document'
            });
        }

        // Check validity (Patient ID is always required)
        if (this.prescriptionForm.get('patientId')?.invalid) {
            alert('Patient ID is required');
            return;
        }

        // For Form mode, items must be valid
        if (this.prescriptionMode === 'FORM' && this.items.invalid) {
            alert('Please fill in all medication details.');
            return;
        }

        const formValue = { ...this.prescriptionForm.value };

        // Clean up optional numeric fields
        // Convert empty strings to null to avoid backend integer parsing errors
        formValue.renewalPeriod = formValue.renewalPeriod ? Number(formValue.renewalPeriod) : null;
        formValue.maxRenewals = formValue.maxRenewals ? Number(formValue.maxRenewals) : null;

        if (this.editingId) {
            this.prescriptionService.updatePrescription(this.editingId, formValue).subscribe(() => {
                this.loadPrescriptions();
                this.cancelEdit();
                alert('Prescription updated successfully!');
            }, error => {
                console.error(error);
                alert('Error updating prescription');
            });

        } else {
            // Create
            this.prescriptionService.createPrescription(formValue, this.selectedFile || undefined).subscribe(() => {
                this.loadPrescriptions();
                this.cancelEdit(); // Reset form
                alert('Prescription created successfully!');
            }, error => {
                // error.error might contain specific message from backend
                console.error('Full error:', error);
                let msg = 'Unknown error';
                if (typeof error.error === 'string') {
                    msg = error.error;
                } else if (error.error && typeof error.error === 'object') {
                    msg = JSON.stringify(error.error, null, 2);
                } else if (error.message) {
                    msg = error.message;
                }
                alert('Error creating prescription: ' + msg);
            });
        }
    }

    renew(id: number) {
        if (!id) return;
        this.prescriptionService.renewPrescription(id).subscribe(() => {
            this.loadPrescriptions();
            alert('Prescription renewed');
        });
    }

    viewHistory(id: number) {
        if (!id) return;
        this.prescriptionService.getHistory(id).subscribe(data => {
            this.selectedHistory = data;
        });
    }

    download(filename: string) {
        window.open(`http://localhost:8080/api/prescriptions/download/${filename}`, '_blank');
    }
}
