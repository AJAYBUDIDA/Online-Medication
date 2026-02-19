import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8080/api/patients';

@Injectable({
    providedIn: 'root'
})
export class PatientService {

    constructor(private http: HttpClient) { }

    getPatients(): Observable<any[]> {
        return this.http.get<any[]>(API_URL);
    }
}
