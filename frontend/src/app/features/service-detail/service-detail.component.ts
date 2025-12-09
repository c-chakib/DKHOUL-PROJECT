import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ServiceService, Service } from '../../core/services/service.service';
import { ChatService, ChatUser } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { map, switchMap } from 'rxjs/operators';
import { ImageFallbackDirective } from '../../shared/directives/image-fallback.directive';
import { ReportModalComponent } from '../../shared/components/modals/report-modal/report-modal.component';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-service-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, ReportModalComponent],
    templateUrl: './service-detail.component.html',
    styleUrls: ['./service-detail.component.scss']
})
export class ServiceDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private serviceService = inject(ServiceService);
    private chatService = inject(ChatService);
    private authService = inject(AuthService);
    private toast = inject(ToastService);

    service = signal<Service | null>(null);
    isLoading = signal<boolean>(true);

    selectedDate = signal<string>(new Date().toISOString().split('T')[0]);
    selectedTime = signal<string>('09:00');
    guests = signal<number>(1);
    duration = signal<number>(1); // Duration in hours

    totalPrice = computed(() => {
        const s = this.service();
        if (!s) return 0;
        return s.price * this.guests() * this.duration();
    });

    // Helper for min date in HTML
    minDate = new Date().toISOString().split('T')[0];

    // Host info from API or fallback
    host = signal({ _id: '', name: 'Youssef', photo: 'assets/images/placeholder-avatar.jpg', bio: 'Passionné par le Maroc et ses trésors cachés.' });

    activeImage = signal<string>('');

    ngOnInit() {
        this.route.paramMap.pipe(
            map(params => params.get('id')),
            switchMap(id => {
                if (!id) throw new Error('Service ID not found');
                return this.serviceService.getServiceById(id);
            })
        ).subscribe({
            next: (res: any) => {
                if (res.data && res.data.service) {
                    this.service.set(res.data.service);
                    // Set initial active image
                    if (res.data.service.images && res.data.service.images.length > 0) {
                        this.activeImage.set(res.data.service.images[0]);
                    }

                    // If service has host info, update it
                    if (res.data.service.host) {
                        const h = res.data.service.host;
                        this.host.set({
                            _id: h._id || '',
                            name: h.name || 'Youssef',
                            photo: h.photo || 'assets/images/placeholder-avatar.jpg',
                            bio: h.bio || 'Passionné par le Maroc et ses trésors cachés.'
                        });
                    }

                    // Set default time from slots if available
                    if (res.data.service.timeSlots && res.data.service.timeSlots.length > 0) {
                        this.selectedTime.set(res.data.service.timeSlots[0]);
                    }
                }
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Error fetching service:', err);
                this.isLoading.set(false);
            }
        });
    }

    onDateChange(event: any) {
        this.selectedDate.set(event.target.value);
    }

    onTimeChange(event: any) {
        this.selectedTime.set(event.target.value);
    }

    onDurationChange(event: any) {
        this.duration.set(parseInt(event.target.value, 10));
    }

    incrementGuests() {
        const current = this.guests();
        const max = this.service()?.maxParticipants || 10;
        if (current < max) {
            this.guests.set(current + 1);
        }
    }

    decrementGuests() {
        const current = this.guests();
        if (current > 1) {
            this.guests.set(current - 1);
        }
    }

    selectImage(url: string) {
        this.activeImage.set(url);
    }

    bookNow() {
        const s = this.service();
        if (!s) {
            this.toast.error('Service not loaded');
            return;
        }

        // Validate booking fields
        if (!this.selectedDate()) {
            this.toast.error('Veuillez sélectionner une date');
            return;
        }
        if (!this.selectedTime()) {
            this.toast.error('Veuillez sélectionner une heure');
            return;
        }

        // Check if user is logged in
        if (!this.authService.currentUser()) {
            this.toast.info('Please login to book');
            this.router.navigate(['/login']);
            return;
        }

        // Navigate with queryParams
        this.router.navigate(['/payment'], {
            queryParams: {
                serviceId: s._id,
                price: this.totalPrice(), // Pass calculated total
                basePrice: s.price,      // Pass base price for reference
                title: s.title,
                date: this.selectedDate(),
                time: this.selectedTime(),
                guests: this.guests(),
                duration: this.duration()
            }
        });
    }

    contactHost() {
        if (!this.authService.currentUser()) {
            this.toast.info("Connectez-vous pour contacter l'hôte");
            this.router.navigate(['/login']);
            return;
        }
        const hostId = this.service()?.host?._id;
        if (hostId) {
            this.chatService.initiateChat(hostId);
            this.toast.success(`Discussion ouverte avec l'hôte`);
        } else {
            this.toast.error('Host ID missing');
        }
    }

    getImageUrl(url: string | undefined): string | null {
        if (!url) return null;
        if (url.startsWith('data:') || url.startsWith('http')) return url;
        return environment.apiUrl.replace('/api/v1', '') + url;
    }
}
