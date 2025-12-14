import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { BookingService } from '../../core/services/booking.service';
import { ChatService } from '../../core/services/chat.service';
import { environment } from '../../../environments/environment';
import { ImageFallbackDirective } from '../../shared/directives/image-fallback.directive';

@Component({
    selector: 'app-booking-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, ImageFallbackDirective],
    templateUrl: './booking-detail.component.html',
    styles: [`
    :host { display: block; }
  `]
})
export class BookingDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private location = inject(Location);
    private bookingService = inject(BookingService);
    private chatService = inject(ChatService);

    booking = signal<any>(null);
    loading = signal<boolean>(true);

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadBooking(id);
        } else {
            this.router.navigate(['/dashboard']);
        }
    }

    loadBooking(id: string) {
        this.bookingService.getBookingById(id).subscribe({
            next: (res) => {
                this.booking.set(res.data.booking);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading booking:', err);
                this.router.navigate(['/dashboard']);
            }
        });
    }

    goBack() {
        this.location.back();
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'pending': return 'En attente';
            case 'confirmed': return 'Confirmée';
            case 'completed': return 'Terminée';
            case 'cancelled': return 'Annulée';
            default: return status;
        }
    }

    getImageUrl(url: string | undefined, type: 'service' | 'avatar' = 'service'): string {
        if (!url) return type === 'avatar' ? 'assets/default-avatar.png' : 'assets/images/placeholder-service.png';

        // Handle local assets (generated items) or relative paths
        if (url.includes('assets/')) {
            return url.startsWith('/') ? url : '/' + url;
        }

        if (url.startsWith('data:') || url.startsWith('http')) return url;

        // Backend uploads
        return environment.apiUrl.replace('/api/v1', '') + url;
    }

    contactHost() {
        const b = this.booking();
        if (b && b.service && b.service.host) {
            this.chatService.initiateChat(b.service.host._id, b.service.host, `Question concernant la réservation #${b._id.slice(-6)}`);
            // Toast handling would be nice here but keeping it simple
        }
    }
}
