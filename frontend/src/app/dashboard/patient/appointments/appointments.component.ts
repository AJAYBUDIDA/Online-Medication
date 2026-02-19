import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReminderService, MedicationReminder } from '../../../services/reminder.service';

@Component({
  selector: 'app-patient-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-slate-50 p-8">
      <div class="max-w-6xl mx-auto">
        <h1 class="text-3xl font-bold text-blue-800 mb-8 flex items-center gap-2">
            <span>⏰</span> Reminders & Appointments
        </h1>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Reminders Section -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 border-t-4 border-t-purple-600">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold text-gray-800">Medication Reminders</h2>
                    <button (click)="showReminderForm = !showReminderForm" class="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 font-bold">
                        {{showReminderForm ? 'Cancel' : '+ Add Reminder'}}
                    </button>
                </div>

                <div *ngIf="showReminderForm" class="bg-purple-50 p-4 rounded-md mb-4 border border-purple-100">
                    <form [formGroup]="reminderForm" (ngSubmit)="addReminder()">
                        <div class="space-y-3">
                            <div>
                                <label class="block text-xs font-bold text-gray-600 uppercase">Medication Name</label>
                                <input formControlName="medicationName" class="w-full p-2 border rounded border-gray-300 text-sm">
                            </div>
                            <div class="grid grid-cols-2 gap-2">
                                <div>
                                    <label class="block text-xs font-bold text-gray-600 uppercase">Dosage</label>
                                    <input formControlName="dosage" class="w-full p-2 border rounded border-gray-300 text-sm" placeholder="e.g. 500mg">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-gray-600 uppercase">Time</label>
                                    <input type="time" formControlName="reminderTime" class="w-full p-2 border rounded border-gray-300 text-sm">
                                </div>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-gray-600 uppercase">Frequency</label>
                                <select formControlName="frequency" class="w-full p-2 border rounded border-gray-300 text-sm">
                                    <option value="DAILY">Daily</option>
                                    <option value="WEEKLY">Weekly</option>
                                </select>
                            </div>
                            <button type="submit" [disabled]="!reminderForm.valid" class="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 font-bold text-sm">Save Reminder</button>
                        </div>
                    </form>
                </div>

                <div class="space-y-2">
                    <div *ngFor="let r of reminders" class="flex items-center justify-between p-3 bg-white border border-gray-100 rounded shadow-sm hover:shadow transition-all">
                        <div class="flex items-center gap-3">
                            <div class="bg-purple-100 text-purple-600 p-2 rounded-full">💊</div>
                            <div>
                                <p class="font-bold text-gray-800">{{r.medicationName}} <span class="text-xs text-gray-400 font-normal">({{r.dosage}})</span></p>
                                <p class="text-xs text-gray-500">{{r.frequency}} at {{r.reminderTime}}</p>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <label class="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" [checked]="r.active" (change)="toggleReminder(r.id!)" class="sr-only peer">
                              <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                            <button (click)="deleteReminder(r.id!)" class="text-red-400 hover:text-red-600">🗑️</button>
                        </div>
                    </div>
                    <div *ngIf="reminders.length === 0" class="text-center py-6 text-gray-400 text-sm">
                        No active reminders.
                    </div>
                    
                    <!-- Debug: Remove in prod -->
                    <!-- <div class="text-xs text-gray-400 mt-2">Debug: Found {{reminders.length}} items</div> -->
                </div>
            </div>

            <!-- Appointments Section (Placeholder) -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 border-t-4 border-t-blue-600">
                <h2 class="text-xl font-bold mb-4 text-gray-800">Upcoming Appointments</h2>
                <div class="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p class="text-gray-500 text-lg">No appointments scheduled.</p>
                    <p class="text-xs text-gray-400 mt-2">Appointment scheduling feature coming soon.</p>
                    <button class="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-bold transition-all disabled:opacity-50" disabled>
                        Book Appointment
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  `
})
export class PatientAppointmentsComponent implements OnInit {
  reminders: MedicationReminder[] = [];
  reminderForm: FormGroup;
  showReminderForm = false;

  constructor(
    private reminderService: ReminderService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef
  ) {
    this.reminderForm = this.fb.group({
      medicationName: ['', Validators.required],
      dosage: ['', Validators.required],
      reminderTime: ['', Validators.required],
      frequency: ['DAILY', Validators.required]
    });
  }

  ngOnInit() {
    this.loadReminders();
  }

  loadReminders() {
    this.reminderService.getMyReminders().subscribe(data => {
      console.log('Reminders fetched:', data);
      this.reminders = data || [];
      this.cd.detectChanges(); // Force UI update
    }, error => {
      console.error('Error fetching reminders:', error);
    });
  }

  addReminder() {
    if (this.reminderForm.valid) {
      this.reminderService.createReminder(this.reminderForm.value).subscribe(newReminder => {
        this.reminders.push(newReminder);
        this.showReminderForm = false;
        this.reminderForm.reset({ frequency: 'DAILY' });
      });
    }
  }

  deleteReminder(id: number) {
    if (confirm('Are you sure?')) {
      this.reminderService.deleteReminder(id).subscribe(() => this.loadReminders());
    }
  }

  toggleReminder(id: number) {
    this.reminderService.toggleReminder(id).subscribe(() => this.loadReminders());
  }
}
