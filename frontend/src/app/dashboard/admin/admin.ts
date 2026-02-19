import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-admin',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './admin.html',
})
export class Admin {
    constructor(private router: Router) { }

    logout() {
        sessionStorage.clear();
        this.router.navigate(['/login']);
    }
}
