import { Component, OnInit, OnChanges, inject, signal, computed, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ImageFallbackDirective } from '../../../shared/directives/image-fallback.directive';
import { BookingService } from '../../../core/services/booking.service';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
    selector: 'app-my-bookings',
    standalone: true,
    imports: [CommonModule, RouterLink, ImageFallbackDirective, ConfirmModalComponent],
    styles: [`
        .filter-btn {
            @apply px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border border-transparent;
        }
        .filter-btn.active {
            @apply bg-primary text-white shadow-sm;
        }
        .filter-btn.inactive {
            @apply bg-white text-gray-600 border-gray-200 hover:bg-gray-50;
        }
    `],
    template: `
    <div class="mb-6 flex flex-wrap gap-2">
        <button (click)="setFilter('all')" [class]="filter() === 'all' ? 'filter-btn active' : 'filter-btn inactive'">Tout</button>
        <button (click)="setFilter('pending')" [class]="filter() === 'pending' ? 'filter-btn active' : 'filter-btn inactive'">⏳ En attente</button>
        <button (click)="setFilter('confirmed')" [class]="filter() === 'confirmed' ? 'filter-btn active' : 'filter-btn inactive'">✅ Confirmées</button>
        <button (click)="setFilter('completed')" [class]="filter() === 'completed' ? 'filter-btn active' : 'filter-btn inactive'">✨ Terminées</button>
        <button (click)="setFilter('cancelled')" [class]="filter() === 'cancelled' ? 'filter-btn active' : 'filter-btn inactive'">❌ Annulées</button>
    </div>

    @if (loading) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (item of [1,2,3]; track $index) {
                <div class="bg-white rounded-xl shadow-sm h-72 animate-pulse border border-gray-100"></div>
            }
        </div>
    } @else {
        @if (filteredBookings().length === 0) {
            <div class="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span class="text-3xl">🎫</span>
                </div>
                <h3 class="text-lg font-bold text-gray-900 mb-2">Aucune réservation {{ filter() !== 'all' ? 'trouvée' : '' }}</h3>
                <p class="text-gray-500 mb-6" *ngIf="filter() === 'all'">Vous n'avez pas encore de réservation.</p>
                <a *ngIf="filter() === 'all'" routerLink="/marketplace" class="text-primary hover:underline font-medium">Explorer les expériences</a>
            </div>
        } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                @for (booking of filteredBookings(); track booking._id) {
                    <!-- Handling Deleted/Null Service -->
                    @if (!booking.service) {
                        <div class="bg-gray-50 rounded-xl shadow-sm border border-gray-200 p-6 relative opacity-75">
                            <button (click)="initDelete(booking._id, $event)" 
                                    class="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm text-red-500 hover:bg-red-50 z-20 transition-colors"
                                    title="Supprimer cette réservation invalide">
                                🗑️
                            </button>
                            <div class="h-40 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                                <span class="text-gray-400 font-medium">Service Supprimé</span>
                            </div>
                            <div class="space-y-2">
                                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                            <div class="mt-4 pt-4 border-t border-gray-200 flex justify-between">
                                <span class="text-sm text-gray-500">{{ booking.bookingDate | date:'shortDate' }}</span>
                                <span class="text-sm font-bold text-gray-400">{{ booking.price }} MAD</span>
                            </div>
                        </div>
                    } @else {
                        <!-- Normal Card -->
                        <div [routerLink]="['/bookings', booking._id]" 
                             class="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 group cursor-pointer relative">
                            
                            <!-- Delete Button (Top Right) -->
                            <button (click)="initDelete(booking._id, $event)" 
                                    class="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full shadow-sm text-gray-400 hover:text-red-500 hover:bg-white z-20 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Supprimer">
                                🗑️
                            </button>

                            <div class="relative h-48 bg-gray-200 overflow-hidden">
                                <img [src]="getImageUrl(booking.service?.images?.[0])" 
                                     [alt]="booking.service?.title"
                                     appImageFallback="assets/images/placeholder-service.png"
                                     class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                                
                                <!-- Status Badge (Top Left now, to not conflict with delete) -->
                                <div class="absolute top-3 left-3">
                                    <span [class]="getStatusClass(booking.status)"
                                          class="px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md">
                                        {{ getStatusLabel(booking.status) }}
                                    </span>
                                </div>
                            </div>
                            <div class="p-5">
                                <h3 class="text-lg font-bold text-gray-900 line-clamp-1 mb-2">{{ booking.service?.title }}</h3>
                                <div class="flex items-center text-sm text-gray-500 mb-3">
                                    <span class="mr-2">📅 {{ booking.bookingDate | date:'d MMM yyyy' }}</span>
                                    <span>🕔 {{ booking.time }}</span>
                                </div>
                                <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div class="flex items-center gap-2">
                                        <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary border border-primary/20 overflow-hidden">
                                            <img *ngIf="booking.service?.host?.photo" [src]="getImageUrl(booking.service.host.photo)" class="w-full h-full object-cover">
                                            <span *ngIf="!booking.service?.host?.photo">{{ (booking.service?.host?.name || 'H')[0] }}</span>
                                        </div>
                                        <span class="text-sm text-gray-600 truncate max-w-[100px]">{{ booking.service?.host?.name }}</span>
                                    </div>
                                    <span class="text-lg font-bold text-primary">{{ booking.price }} MAD</span>
                                </div>
                            </div>
                        </div>
                    }
                }
            </div>
        }
    }

    <app-confirm-modal 
        [isOpen]="showModal()"
        [title]="modalConfig().title"
        [message]="modalConfig().message"
        [confirmText]="modalConfig().confirmText"
        [cancelText]="modalConfig().cancelText"
        [type]="modalConfig().type"
        (confirm)="modalConfig().action()"
        (cancel)="showModal.set(false)">
    </app-confirm-modal>
    `
})
export class MyBookingsComponent implements OnChanges {
    @Input() bookings: any[] = [];
    @Input() loading: boolean = false;

    private bookingService = inject(BookingService);
    private toast = inject(ToastService);

    bookingsSig = signal<any[]>([]);
    filter = signal<string>('all');

    // Modal State
    showModal = signal(false);
    modalConfig = signal({
        title: '',
        message: '',
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        type: 'danger' as 'danger' | 'success',
        action: () => { }
    });

    filteredBookings = computed(() => {
        const all = this.bookingsSig();
        const f = this.filter();
        if (f === 'all') return all;
        return all.filter(b => b.status === f);
    });

    ngOnChanges(changes: SimpleChanges) {
        if (changes['bookings']) {
            this.bookingsSig.set(this.bookings || []);
        }
    }

    setFilter(f: string) {
        this.filter.set(f);
    }

    initDelete(id: string, event: Event) {
        event.stopPropagation();
        event.preventDefault();

        this.modalConfig.set({
            title: 'Supprimer la réservation',
            message: 'Voulez-vous vraiment supprimer cette réservation de votre historique ? Cette action est irréversible.',
            confirmText: 'Supprimer',
            cancelText: 'Annuler',
            type: 'danger',
            action: () => this.performDelete(id)
        });
        this.showModal.set(true);
    }

    performDelete(id: string) {
        this.showModal.set(false);
        this.bookingService.deleteBooking(id).subscribe({
            next: () => {
                this.bookingsSig.update(list => list.filter(b => b._id !== id));
                this.toast.success('Réservation supprimée');
            },
            error: (err) => {
                console.error('Delete failed', err);
                this.toast.error('Impossible de supprimer la réservation.');
            }
        });
    }

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
            case 'pending': return 'En attente';
            case 'confirmed': return 'Confirmée';
            case 'cancelled': return 'Annulée';
            case 'completed': return 'Terminée';
            default: return status;
        }
    }

    getImageUrl(url: string | undefined): string {
        if (!url) return 'assets/images/placeholder-service.png';

        if (url.includes('assets/')) {
            return url.startsWith('/') ? url : '/' + url;
        }

        if (url.startsWith('data:') || url.startsWith('http')) return url;

        return environment.apiUrl.replace('/api/v1', '') + url;
    }
}
