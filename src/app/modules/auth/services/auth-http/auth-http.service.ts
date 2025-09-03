import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserModel } from '../../models/user.model';
import { environment } from '../../../../../environments/environment';
import { AuthModel } from '../../models/auth.model';

const API_USERS_URL = `${environment.app.apiUrl}`;
const API_CLIENT_ID: number = environment.app.clientId;
const API_CLIENT_SECRET = `${environment.app.clientSecret}`;

@Injectable({
    providedIn: 'root'
})
export class AuthHTTPService {
    constructor(private http: HttpClient) {}

    // public methods
    login(username: string, password: string): Observable<any> {
        return this.http.post<AuthModel>(`${API_USERS_URL}/oauth/token`, {
            grant_type: 'password',
            client_id: API_CLIENT_ID,
            client_secret: API_CLIENT_SECRET,
            username,
            password,
            scope: '*'
        });
    }

    // CREATE =>  POST: add a new user to the server
    createUser(user: UserModel): Observable<UserModel> {
        return this.http.post<UserModel>(API_USERS_URL, user);
    }

    // Your server should check email => If email exists send link to the user and return true | If email doesn't exist return false
    forgotPassword(email: string): Observable<boolean> {
        return this.http.post<boolean>(`${API_USERS_URL}/api/forgot-password`, {
            email
        });
    }

    getUserByToken(token: string): Observable<UserModel> {
        const httpHeaders = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
        const user = this.http.get<UserModel>(`${API_USERS_URL}/api/profile`, {
            headers: httpHeaders
        });
        return user;
    }

    logout(token: string): Observable<boolean> {
        const httpHeaders = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
        return this.http.post<boolean>(`${API_USERS_URL}/logout`, {
            headers: httpHeaders
        });
    }

    refreshToken(token: string): Observable<AuthModel> {
        return this.http.post<AuthModel>(`${API_USERS_URL}/oauth/token`, {
            grant_type: 'refresh_token',
            refresh_token: token,
            client_id: API_CLIENT_ID,
            client_secret: API_CLIENT_SECRET,
            scope: '*'
        });
    }
}
