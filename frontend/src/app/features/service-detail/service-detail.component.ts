import { Component, OnInit, signal, inject } from '@angular/core';
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
    selectedDate = signal<string>(''); // For date picker

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

    selectImage(url: string) {
        this.activeImage.set(url);
    }

    bookNow() {
        const s = this.service();
        if (!s) {
            this.toast.error('Service not loaded');
            return;
        }

        // Check if user is logged in
        if (!this.authService.currentUser()) {
            this.toast.info('Please login to book');
            this.router.navigate(['/login']);
            return;
        }

        // Navigate with queryParams (P1 FIX)
        this.router.navigate(['/payment'], {
            queryParams: {
                serviceId: s._id,
                price: s.price,
                title: s.title,
                date: this.selectedDate() || ''
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
            // Using initiateChat as requested by diagnostic
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
