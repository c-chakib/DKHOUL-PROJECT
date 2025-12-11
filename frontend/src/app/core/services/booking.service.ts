import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class BookingService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/bookings`;

    createPaymentIntent(serviceId: string, price: number, date?: string, time?: string, guests?: number, duration?: number): Observable<{ clientSecret: string; bookingId: string }> {
        return this.http.post<{ clientSecret: string; bookingId: string }>(`${this.apiUrl}/create-intent`, {
            serviceId,
            price,
            date: date || undefined,
            time: time || undefined,
            guests: guests || 1,
            duration: duration || 1
        });
    }

    getMyBookings(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/my-bookings`);
    }

    confirmBooking(bookingId: string): Observable<any> {
        return this.http.patch<any>(`${this.apiUrl}/confirm/${bookingId}`, {});
    }

    getHostBookings(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/host-bookings`);
    }

    updateStatus(bookingId: string, status: 'confirmed' | 'cancelled'): Observable<any> {
        return this.http.patch<any>(`${this.apiUrl}/${bookingId}/status`, { status });
    }

    getBookingById(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }
}
