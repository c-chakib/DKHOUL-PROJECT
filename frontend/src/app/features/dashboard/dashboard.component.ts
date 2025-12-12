import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { MyBookingsComponent } from './bookings/my-bookings.component';
import { HostBookingsComponent } from './host/host-bookings/host-bookings.component';
import { BookingService } from '../../core/services/booking.service';
import { AuthService } from '../../core/services/auth.service';
import { ServiceService, Service } from '../../core/services/service.service';
import { environment } from '../../../environments/environment';
import { ImageFallbackDirective } from '../../shared/directives/image-fallback.directive';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { ToastService } from '../../core/services/toast.service';

import { TranslateModule } from '@ngx-translate/core';
import { LangSelectPipe } from '../../shared/pipes/lang-select.pipe';
import { LanguageService } from '../../core/services/language.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink, ImageFallbackDirective, MyBookingsComponent, HostBookingsComponent, ConfirmModalComponent, TranslateModule, LangSelectPipe],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    authService = inject(AuthService);
    bookingService = inject(BookingService);
    serviceService = inject(ServiceService);
    router = inject(Router);
    public languageService = inject(LanguageService);
    private toastService = inject(ToastService);

    bookings = signal<any[]>([]);
    loading = signal<boolean>(true);

    currentUser = this.authService.currentUser;

    // Host Services
    myServices = signal<Service[]>([]);
    loadingServices = signal<boolean>(false);
    activeTab = signal<'bookings' | 'host-bookings' | 'services'>('bookings');

    // Modal State
    showModal = signal(false);
    modalConfig = signal({
        title: '',
        message: '',
        confirmText: 'Confirmer',
        cancelText: 'Annuler',
        type: 'danger' as 'danger' | 'success',
        action: () => { }
    });

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

    confirmDeleteService(id: string) {
        this.modalConfig.set({
            title: 'Supprimer l\'annonce',
            message: 'Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.',
            confirmText: 'Supprimer',
            cancelText: 'Annuler',
            type: 'danger',
            action: () => this.deleteService(id)
        });
        this.showModal.set(true);
    }

    deleteService(id: string) {
        this.showModal.set(false);
        this.serviceService.deleteService(id).subscribe({
            next: () => {
                this.myServices.update(services => services.filter(s => s._id !== id));
                this.toastService.success('Annonce supprimée avec succès.');
            },
            error: (err) => {
                console.error('Error deleting service', err);
                this.toastService.error('Erreur lors de la suppression.');
            }
        });
    }

    setTab(tab: 'bookings' | 'host-bookings' | 'services') {
        this.activeTab.set(tab);
    }

    isHost(): boolean {
        const role = this.currentUser()?.role;
        return role === 'host' || role === 'admin' || role === 'superadmin';
    }

    // Helper to transform relative image paths to full backend URLs
    getImageUrl(url: string | undefined): string {
        if (!url) return 'assets/images/placeholder-service.png';
        if (url.startsWith('data:') || url.startsWith('http')) return url;
        if (url.startsWith('/assets')) return url;
        return environment.apiUrl.replace('/api/v1', '') + url;
    }
}
