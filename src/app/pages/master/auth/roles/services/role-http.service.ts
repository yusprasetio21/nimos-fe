import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { Role } from '../role.model';

const API_ROLE_URL = `${environment.app.apiUrl}/api/roles`;

@Injectable({
    providedIn: 'root'
})
export class RoleHttpService {
    private authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;
    private accessToken = JSON.parse(localStorage.getItem(this.authLocalStorageToken) as string).accessToken;
    private httpHeaders = new HttpHeaders({
        Authorization: `Bearer ${this.accessToken}`
    });

    constructor(private http: HttpClient) {}

    // public methods
    getRoles(): Observable<Role[]> {
        return this.http.get<Role[]>(`${API_ROLE_URL}`, {
            headers: this.httpHeaders
        });
    }

    createRole(role: Role): Observable<Role> {
        return this.http.post<Role>(`${API_ROLE_URL}`, role, {
            headers: this.httpHeaders
        });
    }

    updateRole(role: Role): Observable<Role> {
        const body = {
            _method: 'PUT',
            ...role
        };

        return this.http.post<Role>(`${API_ROLE_URL}/${role.id}`, body, {
            headers: this.httpHeaders
        });
    }

    deleteRole(role: Role): Observable<Role> {
        return this.http.delete<Role>(`${API_ROLE_URL}/${role.id}`, {
            headers: this.httpHeaders
        });
    }

    getRoleById(id: number): Observable<Role> {
        return this.http.get<Role>(`${API_ROLE_URL}/${id}`, {
            headers: this.httpHeaders
        });
    }
}
