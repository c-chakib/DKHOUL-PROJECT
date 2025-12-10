import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface DashboardStats {
    revenue: number;
    usersCount: number;
    servicesCount: number;
    bookingsCount: number;
    reportsCount: number;
    recentBookings: any[];
    categoryStats: { _id: string; count: number }[];
}

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/admin`;

    // --- STATS ---
    getDashboardStats(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/stats`);
    }

    // --- USER MANAGEMENT (GOD MODE) ---
    getAllUsers(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/users`);
    }

    deleteUser(userId: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/users/${userId}`);
    }

    resetUserPassword(userId: string, newPassword: string): Observable<any> {
        return this.http.patch<any>(`${this.apiUrl}/users/${userId}/reset-password`, { newPassword });
    }

    // --- REPORTS ---
    getAllReports(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/reports`);
    }

    updateReportStatus(reportId: string, status: string, adminNotes?: string): Observable<any> {
        return this.http.patch<any>(`${this.apiUrl}/reports/${reportId}`, { status, adminNotes });
    }

    // New: Update User (Role/Status)
    updateUser(userId: string, data: any): Observable<any> {
        // apiUrl is /admin, but updateUser is on /users (which is base /api/v1/users) 
        // effectively /api/v1/users/:id
        // AdminService apiUrl is configured as `${environment.apiUrl}/admin`
        // We need to call `${environment.apiUrl}/users/${userId}`
        // So we strip '/admin' or just construct new url
        const baseUrl = this.apiUrl.replace('/admin', '/users');
        return this.http.patch<any>(`${baseUrl}/${userId}`, data);
    }
}
