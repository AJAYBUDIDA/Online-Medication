import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-doctor-settings',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    template: `
    <div class="min-h-screen bg-slate-50 p-8">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-emerald-800 mb-8 flex items-center gap-2">
            <span>⚙️</span> Settings
        </h1>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Profile Settings -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 border-t-4 border-t-emerald-600">
                <h2 class="text-xl font-bold mb-4 text-gray-800">Profile Information</h2>
                <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Username</label>
                            <input type="text" formControlName="username" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 p-2 border" readonly>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" formControlName="email" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                        </div>
                         <!-- Add more profile fields as needed -->
                        <button type="submit" [disabled]="!profileForm.valid || profileForm.pristine" class="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 font-bold shadow-md transition-all disabled:opacity-50">
                            Update Profile
                        </button>
                    </div>
                </form>
            </div>

            <!-- Password Settings -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 border-t-4 border-t-gray-600">
                <h2 class="text-xl font-bold mb-4 text-gray-800">Change Password</h2>
                <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Current Password</label>
                            <input type="password" formControlName="currentPassword" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">New Password</label>
                            <input type="password" formControlName="newPassword" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Confirm New Password</label>
                            <input type="password" formControlName="confirmPassword" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                        </div>
                        <button type="submit" [disabled]="!passwordForm.valid" class="w-full bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-900 font-bold shadow-md transition-all disabled:opacity-50">
                            Change Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
      </div>
    </div>
  `
})
export class DoctorSettingsComponent implements OnInit {
    profileForm: FormGroup;
    passwordForm: FormGroup;
    user: any;

    constructor(private fb: FormBuilder, private http: HttpClient) {
        this.user = JSON.parse(sessionStorage.getItem('auth-user') || '{}');

        this.profileForm = this.fb.group({
            username: [this.user.username],
            email: [this.user.email, [Validators.required, Validators.email]]
        });

        this.passwordForm = this.fb.group({
            currentPassword: ['', Validators.required],
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required]
        });
    }

    ngOnInit(): void { }

    updateProfile() {
        if (this.profileForm.valid) {
            this.http.put('http://localhost:8080/api/user/profile', this.profileForm.value).subscribe({
                next: (data: any) => {
                    alert(data.message);
                    // Update local storage if needed, or just keep it simple
                    const updatedUser = { ...this.user, email: this.profileForm.value.email };
                    sessionStorage.setItem('auth-user', JSON.stringify(updatedUser));
                },
                error: err => {
                    console.error(err);
                    alert('Error updating profile');
                }
            });
        }
    }

    changePassword() {
        if (this.passwordForm.valid) {
            if (this.passwordForm.value.newPassword !== this.passwordForm.value.confirmPassword) {
                alert('Passwords do not match!');
                return;
            }

            this.http.put('http://localhost:8080/api/user/change-password', this.passwordForm.value).subscribe({
                next: (data: any) => {
                    alert(data.message);
                    this.passwordForm.reset();
                },
                error: err => {
                    console.error(err);
                    alert(err.error?.message || 'Error changing password');
                }
            });
        }
    }
}
