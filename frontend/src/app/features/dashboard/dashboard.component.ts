import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { BookingService } from '../../core/services/booking.service';
import { AuthService } from '../../core/services/auth.service';
import { ServiceService, Service } from '../../core/services/service.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    bookingService = inject(BookingService);
    authService = inject(AuthService);
    serviceService = inject(ServiceService);
    router = inject(Router);

    bookings = signal<any[]>([]);
    loading = signal<boolean>(true);
    currentUser = this.authService.currentUser;

    // Host Services
    myServices = signal<Service[]>([]);
    loadingServices = signal<boolean>(false);
    activeTab = signal<'bookings' | 'services'>('bookings');

    ngOnInit() {
        this.loadBookings();
        // If host, preload services
        const user = this.currentUser();
        if (user && (user.role === 'host' || user.role === 'admin' || user.role === 'superadmin')) {
            this.loadMyServices();
        }
    }

    loadBookings() {
        this.bookingService.getMyBookings().subscribe({
            next: (res) => {
                this.bookings.set(res.data.bookings);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error fetching bookings', err);
                this.loading.set(false);
            }
        });
    }

    loadMyServices() {
        this.loadingServices.set(true);
        this.serviceService.getMyServices().subscribe({
            next: (res) => {
                this.myServices.set(res.data.services);
                this.loadingServices.set(false);
            },
            error: (err) => {
                console.error('Error fetching my services', err);
                this.loadingServices.set(false);
            }
        });
    }

    deleteService(id: string) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
            this.serviceService.deleteService(id).subscribe({
                next: () => {
                    this.myServices.update(services => services.filter(s => s._id !== id));
                    alert('Annonce supprimée avec succès.');
                },
                error: (err) => {
                    console.error('Error deleting service', err);
                    alert('Erreur lors de la suppression.');
                }
            });
        }
    }

    setTab(tab: 'bookings' | 'services') {
        this.activeTab.set(tab);
    }

    isHost(): boolean {
        const role = this.currentUser()?.role;
        return role === 'host' || role === 'admin' || role === 'superadmin';
    }

    // Helper to transform relative image paths to full backend URLs
    getImageUrl(url: string | undefined): string {
        if (!url) return 'assets/images/placeholder-service.jpg';
        if (url.startsWith('data:') || url.startsWith('http')) return url;
        return environment.apiUrl.replace('/api/v1', '') + url;
    }
}
