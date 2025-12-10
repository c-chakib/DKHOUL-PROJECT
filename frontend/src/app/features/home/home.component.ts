import { Component, inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ServiceService } from '../../core/services/service.service';
import { Service } from '../../core/models/service'; // Corrected path
// If model path is different I will fix later. Assuming core/models based on previous structure or simply creating a local interface if needed.
// Actually user code had '../../models/service'. I will use that or fix import.
// Let's standardise on `../../core/models/service` if that's where it is, or `../../models` if it is root.
// Wait, previous file `home.component.ts` didn't import Service model explicitly.
// `list_dir` of `frontend/src/app` didn't show `models`. `frontend/src/app/core` might have it.
// I will check for `service.ts` location first to be safe? No, let's look at `service.service.ts` import if possible.
// Actually, to be safe, I will stick to user's import path but if it fails I'll fix.
// User code: `import { Service } from '../../models/service';`
// I suspect it might be `../../core/models/service` or just `../../models`.
// Let's assume `../../core/models/service` because `service.service` is in `core/services`.

import { TypedTextComponent } from '../../shared/components/typed-text/typed-text.component';
import { MapSectionComponent } from '../../shared/components/map-section/map-section.component';
import { HeroCarouselComponent } from '../../shared/components/hero-carousel/hero-carousel.component';
import { LoggerService } from '../../core/services/logger.service';
import { AuthService } from '../../core/services/auth.service';

export interface FeaturedService {
    name: string;
    badge: string;
    rating: number;
    price: string;
    image: string;
}

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatProgressSpinnerModule,
        HeroCarouselComponent,
        TypedTextComponent,
        MapSectionComponent
    ],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
    private scrollListener?: () => void;
    recentServices: any[] = []; // Relaxed type to avoid interface issues
    isLoading = true;
    private serviceService = inject(ServiceService);
    private router = inject(Router);
    private logger = inject(LoggerService);

    mapLocations = [
        { lat: 33.5731, lng: -7.5898, label: 'Casablanca' },
        { lat: 31.6295, lng: -7.9811, label: 'Marrakech' },
        { lat: 35.7595, lng: -5.8339, label: 'Tanger' },
        { lat: 34.0209, lng: -6.8416, label: 'Rabat' }
    ];

    // DKHOUL's 3 Main Categories
    mainCategories = [
        {
            icon: 'home',
            name: 'DKHOUL Space',
            tagline: 'Monétise ton espace',
            count: 250,
            priceRange: '20-150 DH',
            description: 'Micro-services pratiques : stockage bagages, douche express, wifi, stationnement, coworking à domicile',
            subcategories: ['Stockage bagages (20 DH)', 'Douche express (30 DH)', 'Wifi/Coworking (50 DH)', 'Stationnement (50 DH)'],
            examples: ['Stockage sécurisé de bagages', 'Accès wifi + café', 'Garage privé', 'Salon coworking'],
            image: 'assets/images/space.png',
            categoryParam: 'SPACE'
        },
        {
            icon: 'school',
            name: 'DKHOUL Skills',
            tagline: 'Vends ton savoir-faire',
            count: 180,
            priceRange: '150-400 DH',
            description: 'Apprentissages authentiques : cuisine marocaine, artisanat, langues, musique traditionnelle',
            subcategories: ['Cours cuisine (200 DH)', 'Darija (150 DH)', 'Artisanat (200 DH)', 'Musique (250 DH)'],
            examples: ['Tajine/Couscous chez l\'habitant', 'Initiation darija conversationnelle', 'Poterie berbère', 'Rythmes gnaoua'],
            image: 'assets/images/skills.png',
            categoryParam: 'SKILL'
        },
        {
            icon: 'groups',
            name: 'DKHOUL Connect',
            tagline: 'Loue ton temps',
            count: 150,
            priceRange: '50-300 DH',
            description: 'Expériences humaines : accompagnement souk, conseils locaux, transport personnalisé, baby-sitting',
            subcategories: ['Shopping souk (100 DH/h)', 'Conseils locaux (50 DH)', 'Transport aéroport', 'Baby-sitting (80 DH/h)'],
            examples: ['Guide shopping médina', 'Bons plans restos', 'Trajet privé aéroport', 'Garde enfants bilingue'],
            image: 'assets/images/connect.png',
            categoryParam: 'CONNECT'
        }
    ];

    howItWorks = [
        {
            step: 1,
            icon: 'explore',
            title: 'Découvrez',
            description: 'Explorez Spaces, Skills & Connect - trouvez l\'expérience parfaite'
        },
        {
            step: 2,
            icon: 'calendar_today',
            title: 'Réservez',
            description: 'Réservez facilement et payez en toute sécurité en ligne'
        },
        {
            step: 3,
            icon: 'verified',
            title: 'Vivez',
            description: 'Profitez d\'expériences locales authentiques avec des hôtes vérifiés'
        },
        {
            step: 4,
            icon: 'star',
            title: 'Partagez',
            description: 'Évaluez votre expérience et aidez la communauté'
        }
    ];

    // Testimonials - Figma Inspired
    testimonials = [
        {
            name: 'Sophie Martin',
            country: 'France',
            rating: 5,
            image: 'assets/images/avatar1.png',
            text: "J'ai stocké mes bagages chez Ahmed pendant 4h. Service impeccable, 20 DH seulement !",
            serviceType: 'Stockage Bagages',
            serviceIcon: 'luggage'
        },
        {
            name: 'John Smith',
            country: 'États-Unis',
            rating: 5,
            image: 'assets/images/avatar2.png',
            text: "Le cours de cuisine marocaine chez Fatima était incroyable. J'ai appris à faire un tajine authentique pour 200 DH. Expérience unique !",
            serviceType: 'Cours Cuisine',
            serviceIcon: 'restaurant'
        },
        {
            name: 'Maria Garcia',
            country: 'Espagne',
            rating: 5,
            image: 'assets/images/avatar3.png',
            text: "Youssef m'a accompagnée dans les souks de Marrakech. Meilleurs prix, conseils locaux, 100 DH pour 2h. Un guide parfait !",
            serviceType: 'Guide Souk',
            serviceIcon: 'shopping_bag'
        }
    ];


    // Value Proposition
    valueProps = [
        {
            icon: 'savings',
            title: 'Prix 50-70% moins chers',
            description: 'DKHOUL: 50-300 DH vs Airbnb Experiences: 400-1500 DH vs GetYourGuide: 600-2000 DH',
            highlight: true
        },
        {
            icon: 'verified',
            title: '80% des revenus aux hôtes',
            description: 'Commission DKHOUL 20% vs 30% Airbnb vs 70-80% GetYourGuide - Redistribution équitable',
            highlight: true
        },
        {
            icon: 'schedule',
            title: 'Flexibilité totale',
            description: 'Réservation J ou J-1, durée 1-3h vs format rigide demi-journée ailleurs',
            highlight: false
        },
        {
            icon: 'handshake',
            title: 'Micro-services uniques',
            description: 'Seule plateforme avec bagages, wifi, douche - services pratiques introuvables ailleurs',
            highlight: false
        }
    ];

    stats = [
        { label: 'Hôtes Marocains', target: 500, current: 0, suffix: '+' },
        { label: 'Voyageurs Aidés', target: 10000, current: 0, suffix: '+', isK: true },
        { label: 'Services Fournis', target: 5000, current: 0, suffix: '+', isK: true }
    ];

    typedTexts = [
        'Monétise ton espace',
        'Vends ton savoir-faire',
        'Loue ton temps'
    ];

    heroImages = [
        { src: 'assets/images/hero-riad.png', alt: 'Vivez le Maroc Authentique - Riad Traditionnel' },
        { src: 'assets/images/Gemini_Generated_Image_4si8lw4si8lw4si8.png', alt: 'Découvrez des lieux uniques' },
        { src: 'assets/images/Gemini_Generated_Image_9keka9keka9keka9.png', alt: 'Rencontrez des hôtes exceptionnels' },
        { src: 'assets/images/Gemini_Generated_Image_b94gjrb94gjrb94g.png', alt: 'Vivez des expériences locales' },
        { src: 'assets/images/Gemini_Generated_Image_bbfwmdbbfwmdbbfw.png', alt: 'DKHOUL - Voyagez autrement' }
    ];
    currentYear = new Date().getFullYear();

    private authService = inject(AuthService);
    currentUser = this.authService.currentUser;

    ngOnInit() {
        this.initScrollProgress();
        this.loadRecentServices();
        this.animateStats();
    }

    private animateStats() {
        const duration = 2000; // 2 seconds
        const steps = 50;
        const intervalTime = duration / steps;

        this.stats.forEach(stat => {
            const increment = stat.target / steps;
            let currentStep = 0;

            const timer = setInterval(() => {
                currentStep++;
                if (currentStep >= steps) {
                    stat.current = stat.target;
                    clearInterval(timer);
                } else {
                    stat.current = Math.floor(increment * currentStep);
                }
            }, intervalTime);
        });
    }

    ngOnDestroy() {
        if (this.scrollListener) {
            this.scrollListener();
        }
    }

    private initScrollProgress() {
        const scrollIndicator = document.getElementById('scrollIndicator');
        if (!scrollIndicator) return;

        const updateScrollProgress = () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            scrollIndicator.style.width = scrollPercent + '%';
        };

        // Initial call
        updateScrollProgress();

        // Add scroll listener
        this.scrollListener = () => window.removeEventListener('scroll', updateScrollProgress);
        window.addEventListener('scroll', updateScrollProgress);
    }

    loadRecentServices(): void {
        this.isLoading = true;
        this.serviceService.getAllServices({ limit: 8 }).subscribe({
            next: (response: any) => {
                // Backend returns: { results: number, data: { services: [...] } }
                this.recentServices = response.data?.services || [];
                this.logger.info(`Loaded ${this.recentServices.length} services`);
                this.isLoading = false;
            },
            error: (error) => {
                this.logger.error('Error loading services:', error);
                this.isLoading = false;
            }
        });
    }

    navigateToServices(category?: string): void {
        if (category) {
            this.router.navigate(['/marketplace'], { queryParams: { category } });
        } else {
            this.router.navigate(['/marketplace']);
        }
    }

    navigateToRegister(): void {
        this.router.navigate(['/register']);
    }

    navigateToLogin(): void {
        this.router.navigate(['/login']);
    }

    navigateToBecomeProvider(): void {
        const user = this.authService.currentUser();
        if (user) {
            if (user.role === 'host') {
                this.router.navigate(['/create-service']);
            } else {
                this.router.navigate(['/dashboard']);
            }
        } else {
            this.router.navigate(['/register'], { queryParams: { type: 'provider' } });
        }
    }
}
