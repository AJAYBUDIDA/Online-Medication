import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-patient-profile',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    template: `
    <div class="min-h-screen bg-slate-50 p-6 md:p-10">
      <div class="max-w-5xl mx-auto">
        
        <!-- Header -->
        <div class="mb-10 text-center md:text-left">
            <h1 class="text-4xl font-extrabold text-slate-800 tracking-tight mb-2">My Profile</h1>
            <p class="text-slate-500 text-lg">Manage your personal information and account settings.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- Left Column: Profile Card -->
            <div class="lg:col-span-2 space-y-8">
                <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex items-center gap-4">
                        <div class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold backdrop-blur-sm border-2 border-white/30">
                            {{user.username?.charAt(0).toUpperCase()}}
                        </div>
                        <div>
                            <h2 class="text-2xl font-bold">{{user.username}}</h2>
                            <p class="text-blue-100 opacity-90">{{user.email}}</p>
                            <span class="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-md">Patient Account</span>
                        </div>
                    </div>
                    
                    <div class="p-8">
                         <h3 class="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">Personal Information</h3>
                         <form [formGroup]="profileForm" class="space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-semibold text-slate-600 mb-2">Username</label>
                                    <input type="text" formControlName="username" class="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-500 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" readonly>
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-slate-600 mb-2">Email Address</label>
                                    <input type="email" formControlName="email" class="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-500 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" readonly>
                                </div>
                            </div>
                            
                            <!-- Alert Box -->
                            <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                                <div class="text-amber-500 mt-0.5 text-lg">🔒</div>
                                <div>
                                    <h4 class="text-sm font-bold text-amber-800">Profile Locked</h4>
                                    <p class="text-xs text-amber-700 mt-1 leading-relaxed">
                                        For security reasons and to ensure medical record accuracy, personal details cannot be changed directly. Please contact hospital administration for updates.
                                    </p>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Right Column: Support & Contact -->
            <div class="space-y-6">
                 <!-- Help Card -->
                <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h3 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <span class="text-blue-500">🏥</span> Hospital Support
                    </h3>
                    <p class="text-sm text-slate-500 mb-6">Need to update your details or have questions about your medical records? Reach out to us directly.</p>
                    
                    <div class="space-y-4">
                        <div class="flex items-start gap-3 group p-3 rounded-lg hover:bg-slate-50 transition-colors">
                            <div class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                                📞
                            </div>
                            <div>
                                <p class="text-xs font-bold text-slate-400 uppercase">Emergency Line</p>
                                <p class="text-sm font-bold text-slate-800">+1 (555) 123-4567</p>
                            </div>
                        </div>

                         <div class="flex items-start gap-3 group p-3 rounded-lg hover:bg-slate-50 transition-colors">
                            <div class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
                                📧
                            </div>
                            <div>
                                <p class="text-xs font-bold text-slate-400 uppercase">Email Support</p>
                                <p class="text-sm font-bold text-slate-800">admin@medhospital.com</p>
                            </div>
                        </div>

                         <div class="flex items-start gap-3 group p-3 rounded-lg hover:bg-slate-50 transition-colors">
                            <div class="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100 transition-colors">
                                📍
                            </div>
                            <div>
                                <p class="text-xs font-bold text-slate-400 uppercase">Location</p>
                                <p class="text-sm font-bold text-slate-800">123 Health Ave, MedCity</p>
                            </div>
                        </div>
                    </div>

                    <button class="w-full mt-6 bg-slate-800 text-white py-2.5 rounded-xl font-bold hover:bg-slate-900 transition-colors shadow-lg shadow-slate-200">
                        Request Callback
                    </button>
                </div>
            </div>

        </div>
      </div>
    </div>
  `
})
export class PatientProfileComponent implements OnInit {
    profileForm: FormGroup;
    user: any;

    constructor(private fb: FormBuilder) {
        this.user = JSON.parse(sessionStorage.getItem('auth-user') || '{}');
        this.profileForm = this.fb.group({
            username: [this.user.username],
            email: [this.user.email]
        });
    }

    ngOnInit(): void { }
}
