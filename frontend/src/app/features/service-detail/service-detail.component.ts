import { Component, OnInit, signal, inject, computed, HostListener } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ServiceService, Service } from '../../core/services/service.service';
import { ChatService, ChatUser } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { map, switchMap } from 'rxjs/operators';
import { ImageFallbackDirective } from '../../shared/directives/image-fallback.directive';
import { ReportModalComponent } from '../../shared/components/modals/report-modal/report-modal.component';
import { environment } from '../../../environments/environment';
import { LangSelectPipe } from '../../shared/pipes/lang-select.pipe';
import { LanguageService } from '../../core/services/language.service';

import { ResolveUrlPipe } from '../../shared/pipes/resolve-url.pipe';
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-service-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, ReportModalComponent, TranslateModule, LangSelectPipe, ResolveUrlPipe],
    templateUrl: './service-detail.component.html',
    styleUrls: ['./service-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServiceDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private serviceService = inject(ServiceService);
    private chatService = inject(ChatService);
    private authService = inject(AuthService);
    private toast = inject(ToastService);
    private location = inject(Location);
    public languageService = inject(LanguageService);
    private metaService = inject(Meta);
    private titleService = inject(Title);

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
    host = signal<any>({ name: '', photo: '', bio: '' });

    activeImage = signal<string>('');

    // Computed property for valid images only
    validImages = computed(() => {
        const s = this.service();
        if (!s || !s.images) return [];
        return s.images.filter(img => !!img && img.trim() !== '');
    });

    // Ligthbox State
    lightboxOpen = signal<boolean>(false);
    currentLightboxIndex = signal<number>(0);

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
                    const s = res.data.service;
                    this.service.set(s);

                    // SEO: Update Title & Meta Tags
                    const lang = this.languageService.currentLang();
                    const title = s.title[lang] || s.title['fr'] || s.title['en'];
                    const desc = s.description[lang] || s.description['fr'] || s.description['en'];

                    this.titleService.setTitle(`${title} | DKHOUL`);
                    this.metaService.updateTag({ name: 'description', content: desc });
                    this.metaService.updateTag({ property: 'og:title', content: title });
                    this.metaService.updateTag({ property: 'og:description', content: desc });
                    if (s.images && s.images.length > 0) {
                        this.metaService.updateTag({ property: 'og:image', content: s.images[0] });
                    }

                    // Set initial active image
                    if (s.images && s.images.length > 0) {
                        this.activeImage.set(s.images[0]);
                    }

                    // If service has host info, update it
                    if (s.host) {
                        const h = s.host;
                        this.host.set({
                            _id: h._id || '',
                            name: h.name || 'Youssef',
                            photo: h.photo || 'assets/images/placeholder-avatar.jpg',
                            bio: h.bio || 'Passionné par le Maroc et ses trésors cachés.'
                        });
                    }

                    // Set default time from slots if available
                    if (s.timeSlots && s.timeSlots.length > 0) {
                        this.selectedTime.set(s.timeSlots[0]);
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
        const currentLang = this.languageService.currentLang();
        const title = (s.title && s.title[currentLang]) ? s.title[currentLang] : (s.title['fr'] || s.title);

        this.router.navigate(['/payment'], {
            queryParams: {
                serviceId: s._id,
                price: this.totalPrice(),
                basePrice: s.price,
                title: title,
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
        const host = this.service()?.host;
        if (host && host._id) {
            const s = this.service();
            const currentLang = this.languageService.currentLang();
            const title = s ? ((s.title && s.title[currentLang]) ? s.title[currentLang] : (s.title['fr'] || s.title)) : '';

            // Pass Host Object + Context (Service Title)
            this.chatService.initiateChat(host._id, host, `Intéressé par : ${title}`);
            this.toast.success(`Discussion ouverte avec l'hôte`);
        } else {
            this.toast.error('Host info missing');
        }
    }



    goBack(): void {
        this.location.back();
    }

    openLightbox(index: number): void {
        this.currentLightboxIndex.set(index);
        this.lightboxOpen.set(true);
        document.body.style.overflow = 'hidden'; // Disable scroll
    }

    closeLightbox(): void {
        this.lightboxOpen.set(false);
        document.body.style.overflow = 'auto'; // Re-enable scroll
    }

    nextLightboxImage(): void {
        const images = this.validImages();
        if (images.length === 0) return;
        this.currentLightboxIndex.update(i => (i + 1) % images.length);
    }

    prevLightboxImage(): void {
        const images = this.validImages();
        if (images.length === 0) return;
        this.currentLightboxIndex.update(i => (i - 1 + images.length) % images.length);
    }

    // Close on Escape key
    @HostListener('document:keydown', ['$event'])
    onKeydownHandler(event: KeyboardEvent) {
        if (event.key === 'Escape' && this.lightboxOpen()) {
            this.closeLightbox();
        }
        if (this.lightboxOpen()) {
            if (event.key === 'ArrowRight') this.nextLightboxImage();
            if (event.key === 'ArrowLeft') this.prevLightboxImage();
        }
    }
}
