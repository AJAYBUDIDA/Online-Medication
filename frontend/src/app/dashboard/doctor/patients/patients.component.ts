import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../../services/patient.service';

@Component({
    selector: 'app-doctor-patients',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="min-h-screen bg-slate-50 p-8">
      <div class="max-w-6xl mx-auto">
        <h1 class="text-3xl font-bold text-emerald-800 mb-8 flex items-center gap-2">
            <span>👥</span> My Patients
        </h1>

        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 border-t-4 border-t-emerald-600">
            <h2 class="text-xl font-bold mb-4 text-gray-800">Patient List</h2>
            
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr *ngFor="let patient of patients">
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{{patient.id}}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{patient.user.username}}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{patient.user.email}}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{patient.age}}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{patient.gender}}</td>
                             <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{patient.phone}}</td>
                        </tr>
                        <tr *ngIf="patients.length === 0">
                            <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">No patients found.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  `
})
export class DoctorPatientsComponent implements OnInit {
    patients: any[] = [];

    constructor(private patientService: PatientService) { }

    ngOnInit(): void {
        this.loadPatients();
    }

    loadPatients() {
        this.patientService.getPatients().subscribe({
            next: (data) => {
                this.patients = data;
            },
            error: (e) => console.error(e)
        });
    }
}
