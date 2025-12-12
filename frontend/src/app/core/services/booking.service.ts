import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

import { Booking } from '../models/booking.model';

@Injectable({
    providedIn: 'root'
})
export class BookingService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/bookings`;

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

    getMyBookings(): Observable<{ status: string, data: { bookings: Booking[] } }> {
        return this.http.get<{ status: string, data: { bookings: Booking[] } }>(`${this.apiUrl}/my-bookings`);
    }

    confirmBooking(bookingId: string): Observable<{ status: string, data: { booking: Booking } }> {
        return this.http.patch<{ status: string, data: { booking: Booking } }>(`${this.apiUrl}/confirm/${bookingId}`, {});
    }

    getHostBookings(): Observable<{ status: string, data: { bookings: Booking[] } }> {
        return this.http.get<{ status: string, data: { bookings: Booking[] } }>(`${this.apiUrl}/host-bookings`);
    }

    updateStatus(bookingId: string, status: 'confirmed' | 'cancelled'): Observable<{ status: string, data: { booking: Booking } }> {
        return this.http.patch<{ status: string, data: { booking: Booking } }>(`${this.apiUrl}/${bookingId}/status`, { status });
    }

    getBookingById(id: string): Observable<{ status: string, data: { booking: Booking } }> {
        return this.http.get<{ status: string, data: { booking: Booking } }>(`${this.apiUrl}/${id}`);
    }

    deleteBooking(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
