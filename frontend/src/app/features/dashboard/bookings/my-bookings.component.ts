import { Component, OnInit, inject, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ImageFallbackDirective } from '../../../shared/directives/image-fallback.directive';
import { BookingService } from '../../../core/services/booking.service';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-my-bookings',
    standalone: true,
    imports: [CommonModule, RouterLink, ImageFallbackDirective],
    template: `
    @if (loading) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (item of [1,2,3]; track $index) {
                <div class="bg-white rounded-xl shadow-sm h-72 animate-pulse border border-gray-100"></div>
            }
        </div>
    } @else {
        @if (bookings.length === 0) {
            <div class="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
                <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span class="text-5xl">🎫</span>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">Aucune réservation</h3>
                <p class="text-gray-500 mb-6 max-w-md mx-auto">Vous n'avez pas encore réservé d'expérience. Explorez nos offres et vivez des moments uniques au Maroc.</p>
                <a routerLink="/marketplace" class="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors">
                    Découvrir les expériences →
                </a>
            </div>
        } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                @for (booking of bookings; track booking._id) {
                    <div class="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 group">
                        <div class="relative h-48 bg-gray-200 overflow-hidden">
                            <img [src]="getImageUrl(booking.service?.images?.[0])" 
                                 [alt]="booking.service?.title"
                                 appImageFallback="assets/images/placeholder-service.jpg"
                                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                            
                            <!-- Status Badge -->
                            <div class="absolute top-3 right-3">
                                <span [class]="getStatusClass(booking.status)"
                                      class="px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md">
                                    {{ getStatusLabel(booking.status) }}
                                </span>
                            </div>
                        </div>
                        <div class="p-5">
                            <h3 class="text-lg font-bold text-gray-900 line-clamp-1 mb-2">{{ booking.service?.title }}</h3>
                            <div class="flex items-center text-sm text-gray-500 mb-3">
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                {{ booking.bookingDate | date:'d MMMM yyyy' }}
                            </div>
                            <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div class="flex items-center gap-2">
                                    <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary border border-primary/20">
                                        {{ (booking.service?.host?.name || 'H')[0] }}
                                    </div>
                                    <span class="text-sm text-gray-600 truncate max-w-[100px]">{{ booking.service?.host?.name }}</span>
                                </div>
                                <span class="text-lg font-bold text-primary">{{ booking.price }} MAD</span>
                            </div>
                        </div>
                    </div>
                }
            </div>
        }
    }
  `
})
export class MyBookingsComponent {
    @Input() bookings: any[] = [];
    @Input() loading: boolean = false;

    // bookingService no longer needed for fetching, but might be needed if we add actions (cancel etc)
    // For now just display
    private bookingService = inject(BookingService); // Kept if needed later, or remove if unused. 
    // Actually, let's remove unused injection to be clean, or keep for potential future "Cancel" button.
    // The task didn't ask for Guest Cancel, so let's keep it simple.

    getStatusClass(status: string): string {
        switch (status) {
            case 'pending': return 'bg-yellow-500/90 text-white';
            case 'confirmed': return 'bg-green-500/90 text-white';
            case 'cancelled': return 'bg-red-500/90 text-white';
            case 'completed': return 'bg-blue-500/90 text-white';
            default: return 'bg-gray-500/90 text-white';
        }
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'pending': return '⏳ En attente';
            case 'confirmed': return '✓ Confirmée';
            case 'cancelled': return '✕ Annulée';
            case 'completed': return '★ Terminée';
            default: return status;
        }
    }

    getImageUrl(url: string | undefined): string {
        if (!url) return 'assets/images/placeholder-service.jpg';
        if (url.startsWith('data:') || url.startsWith('http')) return url;
        return environment.apiUrl.replace('/api/v1', '') + url;
    }
}
