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

    createPaymentIntent(serviceId: string, price: number, date?: string): Observable<{ clientSecret: string; bookingId: string }> {
        return this.http.post<{ clientSecret: string; bookingId: string }>(`${this.apiUrl}/create-intent`, {
            serviceId,
            price,
            date: date || undefined
        });
    }

    getMyBookings(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/my-bookings`);
    }

    confirmBooking(bookingId: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/confirm/${bookingId}`, {});
    }
}
