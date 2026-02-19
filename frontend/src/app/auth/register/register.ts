import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
    templateUrl: './register.html',
    styleUrls: []
})
export class Register implements OnInit {
    form: any = {
        username: null,
        email: null,
        password: null,
        role: null,
        specialization: null,
        licenseNumber: null,
        hospitalName: null,
        pharmacyName: null,
        gstNumber: null,
        medicalHistory: null,
        allergies: null,
        age: null
    };
    isSuccessful = false;
    isSignUpFailed = false;
    errorMessage = '';
    currentRole: string = '';

    roleGradients: { [key: string]: string } = {
        'patient': 'bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400',
        'doctor': 'bg-gradient-to-br from-green-600 via-emerald-500 to-teal-500',
        'pharmacist': 'bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500',
        'admin': 'bg-gradient-to-br from-purple-700 via-fuchsia-600 to-pink-500'
    };
    currentGradient: string = 'bg-gray-100';

    constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) { }

    ngOnInit(): void {
        this.currentRole = this.route.snapshot.paramMap.get('role') || 'patient';
        this.form.role = this.currentRole;
        this.currentGradient = this.roleGradients[this.currentRole] || this.roleGradients['patient'];
    }

    onSubmit(): void {
        const { username, email, password, role } = this.form;
        const body = { ...this.form }; // Send all form data

        this.http.post('http://localhost:8080/api/auth/signup', body)
            .subscribe({
                next: data => {
                    this.isSuccessful = true;
                    this.isSignUpFailed = false;
                    setTimeout(() => {
                        this.router.navigate(['/login', this.currentRole]);
                    }, 2000);
                },
                error: err => {
                    this.errorMessage = err.error.message;
                    this.isSignUpFailed = true;
                }
            });
    }
}
