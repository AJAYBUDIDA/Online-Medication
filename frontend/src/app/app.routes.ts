import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { Admin } from './dashboard/admin/admin';
import { Doctor } from './dashboard/doctor/doctor';
import { Patient } from './dashboard/patient/patient';
import { Pharmacist } from './dashboard/pharmacist/pharmacist';
import { DoctorPrescriptionComponent } from './dashboard/doctor/prescription/prescription.component';
import { PatientPrescriptionComponent } from './dashboard/patient/prescription/prescription.component';
import { PatientAppointmentsComponent } from './dashboard/patient/appointments/appointments.component';
import { PatientProfileComponent } from './dashboard/patient/profile/profile.component';
import { PharmacistPrescriptionComponent } from './dashboard/pharmacist/prescription/prescription.component';
import { DoctorPatientsComponent } from './dashboard/doctor/patients/patients.component';
import { DoctorSettingsComponent } from './dashboard/doctor/settings/settings.component';
import { authGuard } from './guards/auth.guard';
import { Home } from './home/home';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'login/:role', component: Login },
    { path: 'register/:role', component: Register },
    { path: 'admin', component: Admin, canActivate: [authGuard] },
    { path: 'doctor', component: Doctor, canActivate: [authGuard] },
    { path: 'doctor/prescriptions', component: DoctorPrescriptionComponent, canActivate: [authGuard] },
    { path: 'doctor/patients', component: DoctorPatientsComponent, canActivate: [authGuard] },
    { path: 'doctor/settings', component: DoctorSettingsComponent, canActivate: [authGuard] },
    { path: 'patient', component: Patient, canActivate: [authGuard] },
    { path: 'patient/prescriptions', component: PatientPrescriptionComponent, canActivate: [authGuard] },
    { path: 'patient/appointments', component: PatientAppointmentsComponent, canActivate: [authGuard] },
    { path: 'patient/profile', component: PatientProfileComponent, canActivate: [authGuard] },
    { path: 'pharmacist', component: Pharmacist, canActivate: [authGuard] },
    { path: 'pharmacist/validations', component: PharmacistPrescriptionComponent, canActivate: [authGuard] },
    { path: '**', redirectTo: '' }
];
