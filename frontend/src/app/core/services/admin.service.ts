import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
    revenue: number;
    usersCount: number;
    servicesCount: number;
    bookingsCount: number;
    recentBookings: any[];
    categoryStats: { _id: string; count: number }[];
}

import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/admin`;

    getStats(): Observable<{ status: string; data: DashboardStats }> {
        return this.http.get<{ status: string; data: DashboardStats }>(`${this.apiUrl}/stats`);
    }
}
