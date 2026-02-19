import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrls: []
})
export class Login implements OnInit {
  form: any = {
    email: null,
    password: null
  };
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  roles: string[] = [];
  currentRole: string = 'user';

  // Role-specific gradient maps
  roleGradients: { [key: string]: string } = {
    'patient': 'bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400',
    'doctor': 'bg-gradient-to-br from-green-600 via-emerald-500 to-teal-500',
    'pharmacist': 'bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500',
    'admin': 'bg-gradient-to-br from-purple-700 via-fuchsia-600 to-pink-500',
    'user': 'bg-gradient-to-br from-gray-700 via-gray-600 to-gray-500'
  };
  currentGradient: string = this.roleGradients['user'];

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.currentRole = this.route.snapshot.paramMap.get('role') || 'user';
    this.currentGradient = this.roleGradients[this.currentRole] || this.roleGradients['user'];
  }

  onSubmit(): void {
    const { email, password } = this.form;

    // Hardcoded API URL for MVP, should use environment
    this.http.post<any>('http://localhost:8080/api/auth/signin', { email, password })
      .subscribe({
        next: (data) => {
          // Token storage logic (simplified for now)
          sessionStorage.setItem('auth-token', data.token);
          sessionStorage.setItem('auth-user', JSON.stringify(data));

          this.isLoginFailed = false;
          this.isLoggedIn = true;
          this.roles = data.roles;

          // Redirect based on role
          if (this.roles.includes('admin') || this.roles.includes('ADMIN')) {
            this.router.navigate(['/admin']);
          } else if (this.roles.includes('doctor') || this.roles.includes('DOCTOR')) {
            this.router.navigate(['/doctor']);
          } else if (this.roles.includes('pharmacist') || this.roles.includes('PHARMACIST')) {
            this.router.navigate(['/pharmacist']);
          } else {
            this.router.navigate(['/patient']);
          }
        },
        error: (err) => {
          this.errorMessage = err.error.message;
          this.isLoginFailed = true;
        }
      });
  }
}
