import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
    _id: string;
    name: string;
    email: string;
    photo?: string;
    bio?: string;
    role: string;
    isVerified: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/me`;
    private authUrl = `${environment.apiUrl}/users`;

    /**
     * Get current user profile
     */
    getMe(): Observable<{ status: string; data: { user: User } }> {
        return this.http.get<any>(`${this.apiUrl}/me`);
    }

    /**
     * Update current user profile (name, email, bio, photo)
     */
    updateMe(formData: FormData): Observable<{ status: string; data: { user: User } }> {
        return this.http.patch<any>(`${this.apiUrl}/updateMe`, formData);
    }

    /**
     * Update current user password
     */
    updateMyPassword(passwordData: {
        currentPassword: string;
        password: string;
        passwordConfirm: string;
    }): Observable<{ status: string; token: string; data: { user: User } }> {
        return this.http.patch<any>(`${this.apiUrl}/updateMyPassword`, passwordData);
    }

    /**
     * Request password reset email
     */
    forgotPassword(email: string): Observable<{ status: string; message: string }> {
        return this.http.post<any>(`${this.authUrl}/forgotPassword`, { email });
    }

    /**
     * Reset password with token
     */
    resetPassword(token: string, password: string, passwordConfirm: string): Observable<any> {
        return this.http.patch<any>(`${this.authUrl}/resetPassword/${token}`, {
            password,
            passwordConfirm
        });
    }
}
