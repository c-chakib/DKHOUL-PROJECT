import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../../../core/services/booking.service';
import { ToastService } from '../../../../core/services/toast.service';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-host-bookings',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-6 border-b border-gray-100">
        <h2 class="text-xl font-bold text-gray-900">Réservations Reçues</h2>
        <p class="text-gray-500 text-sm">Gérez les demandes de réservation pour vos expériences.</p>
      </div>
      
      @if (loading()) {
        <div class="p-8 text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
            <p class="mt-2 text-gray-500">Chargement...</p>
        </div>
      } @else if (bookings().length === 0) {
        <div class="p-12 text-center">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-3xl">📭</span>
            </div>
            <h3 class="text-lg font-bold text-gray-900">Aucune demande</h3>
            <p class="text-gray-500">Vous n'avez pas encore reçu de demande de réservation.</p>
        </div>
      } @else {
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-gray-600">
                <thead class="bg-gray-50 text-gray-900 border-b border-gray-100">
                    <tr>
                        <th class="px-6 py-4 font-semibold">Voyageur</th>
                        <th class="px-6 py-4 font-semibold">Expérience</th>
                        <th class="px-6 py-4 font-semibold">Date & Heure</th>
                        <th class="px-6 py-4 font-semibold">Prix</th>
                        <th class="px-6 py-4 font-semibold">Statut</th>
                        <th class="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    @for (booking of bookings(); track booking._id) {
                        <tr class="hover:bg-gray-50/50 transition-colors">
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-3">
                                    <img [src]="getImageUrl(booking.tourist?.photo)" 
                                         class="w-10 h-10 rounded-full object-cover border border-gray-200">
                                    <div>
                                        <div class="font-bold text-gray-900">{{ booking.tourist?.name }}</div>
                                        <div class="text-xs text-gray-500">{{ booking.tourist?.email }}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <span class="font-medium text-gray-900">{{ booking.service?.title }}</span>
                            </td>
                            <td class="px-6 py-4">
                                <div>{{ booking.bookingDate | date:'d MMM yyyy' }}</div>
                                <div class="text-xs text-gray-500">{{ booking.time }}</div>
                            </td>
                            <td class="px-6 py-4 font-bold text-primary">
                                {{ booking.price }} MAD
                            </td>
                            <td class="px-6 py-4">
                                <span [class]="getStatusClass(booking.status)" 
                                      class="px-2.5 py-1 rounded-full text-xs font-bold capitalize">
                                    {{ getStatusLabel(booking.status) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-right">
                                @if (booking.status === 'pending') {
                                    <div class="flex items-center justify-end gap-2">
                                        <button (click)="updateStatus(booking, 'confirmed')" 
                                                class="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                                                title="Accepter">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                            </svg>
                                        </button>
                                        <button (click)="updateStatus(booking, 'cancelled')" 
                                                class="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                                title="Refuser">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                } @else {
                                    <span class="text-xs text-gray-400 italic">Aucune action</span>
                                }
                            </td>
                        </tr>
                    }
                </tbody>
            </table>
        </div>
      }
    </div>
  `
})
export class HostBookingsComponent implements OnInit {
    bookingService = inject(BookingService);
    toast = inject(ToastService);

    bookings = signal<any[]>([]);
    loading = signal<boolean>(true);

    ngOnInit() {
        this.loadBookings();
    }

    loadBookings() {
        this.bookingService.getHostBookings().subscribe({
            next: (res) => {
                this.bookings.set(res.data.bookings);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading host bookings:', err);
                this.loading.set(false);
            }
        });
    }

    updateStatus(booking: any, status: 'confirmed' | 'cancelled') {
        if (!confirm(status === 'confirmed' ? 'Accepter cette réservation ?' : 'Refuser cette réservation ?')) return;

        // Optimistic update
        const oldStatus = booking.status;
        this.bookings.update(bs => bs.map(b => b._id === booking._id ? { ...b, status } : b));

        this.bookingService.updateStatus(booking._id, status).subscribe({
            next: () => {
                this.toast.success('Succès', `Réservation ${status === 'confirmed' ? 'acceptée' : 'refusée'}`);
            },
            error: (err) => {
                console.error('Error updating status:', err);
                this.toast.error('Erreur', 'Action impossible');
                // Revert on error
                this.bookings.update(bs => bs.map(b => b._id === booking._id ? { ...b, status: oldStatus } : b));
            }
        });
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'confirmed': return 'bg-green-100 text-green-700';
            case 'completed': return 'bg-blue-100 text-blue-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
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

    getImageUrl(url: string | undefined): string {
        if (!url) return 'assets/default-avatar.png';
        if (url.startsWith('data:') || url.startsWith('http')) return url;
        return environment.apiUrl.replace('/api/v1', '') + url;
    }
}
