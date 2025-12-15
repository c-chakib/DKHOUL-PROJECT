import { Component, inject, OnInit, OnDestroy, HostListener, Renderer2, ChangeDetectionStrategy, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

import { ServiceService } from '../../core/services/service.service';
import { LanguageService } from '../../core/services/language.service';

import { TypedTextComponent } from '../../shared/components/typed-text/typed-text.component';
import { MapSectionComponent } from '../../shared/components/map-section/map-section.component';
import { HeroCarouselComponent } from '../../shared/components/hero-carousel/hero-carousel.component';
import { LoggerService } from '../../core/services/logger.service';
import { AuthService } from '../../core/services/auth.service';

import { LangSelectPipe } from '../../shared/pipes/lang-select.pipe';

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
        MapSectionComponent,
        TranslateModule,
        LangSelectPipe
    ],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy {
    private scrollListener?: () => void;
    private langChangeSub?: Subscription;
    recentServices = signal<any[]>([]);
    isLoading = signal<boolean>(true);
    private serviceService = inject(ServiceService);
    private router = inject(Router);
    private logger = inject(LoggerService);
    public translate = inject(TranslateService);

    private renderer = inject(Renderer2);
    private cdr = inject(ChangeDetectorRef);

    currentYear = new Date().getFullYear();

    // Translation Keys for Home
    homeKeys = {
        HERO: 'HOME.HERO',
        CATEGORIES: 'HOME.CATEGORIES',
        FEATURED: 'HOME.FEATURED',
        HOW_IT_WORKS: 'HOME.HOW_IT_WORKS',
        VALUE_PROP: 'HOME.VALUE_PROP',
        TESTIMONIALS: 'HOME.TESTIMONIALS'
    };

    stats = [
        { labelKey: 'HOME.HERO.STATS.HOSTS', target: 500, current: 0, suffix: '+' },
        { labelKey: 'HOME.HERO.STATS.TRAVELERS', target: 10000, current: 0, suffix: '+', isK: true },
        { labelKey: 'HOME.HERO.STATS.SERVICES', target: 5000, current: 0, suffix: '+', isK: true }
    ];

    // Typed Text Logic
    typedTextsKeys = [
        'HOME.HERO.TYPED.TEXT_1',
        'HOME.HERO.TYPED.TEXT_2',
        'HOME.HERO.TYPED.TEXT_3',
        'HOME.HERO.TYPED.TEXT_4'
    ];
    translatedTexts: string[] = [];

    mapLocations = [
        { lat: 33.5731, lng: -7.5898, label: 'Casablanca' },
        { lat: 31.6295, lng: -7.9811, label: 'Marrakech' },
        { lat: 35.7595, lng: -5.8339, label: 'Tanger' },
        { lat: 34.0209, lng: -6.8416, label: 'Rabat' }
    ];

    // Array of keys for ngFor loops, actual content will be piped | translate
    mainCategories = [
        {
            icon: 'home',
            nameKey: 'HOME.CATEGORIES.ITEMS.SPACE.NAME',
            taglineKey: 'HOME.CATEGORIES.ITEMS.SPACE.TAGLINE',
            count: 250,
            priceRangeKey: 'HOME.CATEGORIES.ITEMS.SPACE.PRICE_RANGE', // Add to JSON if needed or keep static
            priceRange: '20-150 DH', // Static for now
            descriptionKey: 'HOME.CATEGORIES.ITEMS.SPACE.DESC',
            ctaKey: 'HOME.CATEGORIES.ITEMS.SPACE.CTA',
            examples: [
                'HOME.CATEGORIES.ITEMS.SPACE.EXAMPLES.1',
                'HOME.CATEGORIES.ITEMS.SPACE.EXAMPLES.2',
                'HOME.CATEGORIES.ITEMS.SPACE.EXAMPLES.3',
                'HOME.CATEGORIES.ITEMS.SPACE.EXAMPLES.4'
            ],
            image: 'assets/images/space_small.webp',
            categoryParam: 'SPACE'
        },
        {
            icon: 'school',
            nameKey: 'HOME.CATEGORIES.ITEMS.SKILL.NAME',
            taglineKey: 'HOME.CATEGORIES.ITEMS.SKILL.TAGLINE',
            count: 180,
            priceRange: '150-400 DH',
            descriptionKey: 'HOME.CATEGORIES.ITEMS.SKILL.DESC',
            ctaKey: 'HOME.CATEGORIES.ITEMS.SKILL.CTA',
            examples: [
                'HOME.CATEGORIES.ITEMS.SKILL.EXAMPLES.1',
                'HOME.CATEGORIES.ITEMS.SKILL.EXAMPLES.2',
                'HOME.CATEGORIES.ITEMS.SKILL.EXAMPLES.3',
                'HOME.CATEGORIES.ITEMS.SKILL.EXAMPLES.4'
            ],
            image: 'assets/images/skills_small.webp',
            categoryParam: 'SKILL'
        },
        {
            icon: 'groups',
            nameKey: 'HOME.CATEGORIES.ITEMS.CONNECT.NAME',
            taglineKey: 'HOME.CATEGORIES.ITEMS.CONNECT.TAGLINE',
            count: 150,
            priceRange: '50-300 DH',
            descriptionKey: 'HOME.CATEGORIES.ITEMS.CONNECT.DESC',
            ctaKey: 'HOME.CATEGORIES.ITEMS.CONNECT.CTA',
            examples: [
                'HOME.CATEGORIES.ITEMS.CONNECT.EXAMPLES.1',
                'HOME.CATEGORIES.ITEMS.CONNECT.EXAMPLES.2',
                'HOME.CATEGORIES.ITEMS.CONNECT.EXAMPLES.3',
                'HOME.CATEGORIES.ITEMS.CONNECT.EXAMPLES.4'
            ],
            image: 'assets/images/connect_small.webp',
            categoryParam: 'CONNECT'
        }
    ];

    howItWorks = [
        { step: 1, icon: 'explore', titleKey: 'HOME.HOW_IT_WORKS.STEPS.1.TITLE', descKey: 'HOME.HOW_IT_WORKS.STEPS.1.DESC' },
        { step: 2, icon: 'calendar_today', titleKey: 'HOME.HOW_IT_WORKS.STEPS.2.TITLE', descKey: 'HOME.HOW_IT_WORKS.STEPS.2.DESC' },
        { step: 3, icon: 'verified', titleKey: 'HOME.HOW_IT_WORKS.STEPS.3.TITLE', descKey: 'HOME.HOW_IT_WORKS.STEPS.3.DESC' },
        { step: 4, icon: 'star', titleKey: 'HOME.HOW_IT_WORKS.STEPS.4.TITLE', descKey: 'HOME.HOW_IT_WORKS.STEPS.4.DESC' }
    ];

    heroImages = [
        { src: 'assets/images/hero-riad.webp', alt: 'HOME.HERO_IMAGES.RIAD' },
        { src: 'assets/images/Gemini_Generated_Image_9keka9keka9keka9.webp', alt: 'HOME.HERO_IMAGES.HOSTS' },
        { src: 'assets/images/Gemini_Generated_Image_b94gjrb94gjrb94g.webp', alt: 'HOME.HERO_IMAGES.EXPERIENCES' },
        { src: 'assets/images/Gemini_Generated_Image_bbfwmdbbfwmdbbfw.webp', alt: 'HOME.HERO_IMAGES.TRAVEL' },
        { src: 'assets/images/Gemini_Generated_Image_i1bvcoi1bvcoi1bv.webp', alt: 'HOME.HERO_IMAGES.CRAFTS' },
        { src: 'assets/images/Gemini_Generated_Image_lhlkz1lhlkz1lhlk.webp', alt: 'HOME.HERO_IMAGES.FOOD' },
        { src: 'assets/images/Gemini_Generated_Image_lhrdlmlhrdlmlhrd.webp', alt: 'HOME.HERO_IMAGES.LANDSCAPES' },
        { src: 'assets/images/Gemini_Generated_Image_npjqhjnpjqhjnpjq.webp', alt: 'HOME.HERO_IMAGES.WORK' },
        { src: 'assets/images/Gemini_Generated_Image_ssvgmpssvgmpssvg.webp', alt: 'HOME.HERO_IMAGES.ARCHI' },
        { src: 'assets/images/Gemini_Generated_Image_sszal4sszal4ssza.webp', alt: 'HOME.HERO_IMAGES.HOSPITALITY' }
    ];

    // Explicitly exposing currentYear as a public property if needed by template, 
    // though I declared it above. Ensuring it's cleaner.
    // currentYear is already at top of class.

    // ... Methods below

    testimonials = [
        {
            name: 'Sophie Martin',
            country: 'France',
            rating: 5,
            image: 'assets/images/avatar1.webp',
            textKey: 'HOME.TESTIMONIALS.REVIEWS.1',
            serviceTypeKey: 'HOME.TESTIMONIALS.TYPES.LUGGAGE',
            serviceIcon: 'luggage'
        },
        {
            name: 'John Smith',
            country: 'États-Unis',
            rating: 5,
            image: 'assets/images/avatar2.webp',
            textKey: 'HOME.TESTIMONIALS.REVIEWS.2',
            serviceTypeKey: 'HOME.TESTIMONIALS.TYPES.COOKING',
            serviceIcon: 'restaurant'
        },
        {
            name: 'Maria Garcia',
            country: 'Espagne',
            rating: 5,
            image: 'assets/images/avatar3.webp',
            textKey: 'HOME.TESTIMONIALS.REVIEWS.3',
            serviceTypeKey: 'HOME.TESTIMONIALS.TYPES.GUIDE',
            serviceIcon: 'shopping_bag'
        }
    ];

    valueProps = [
        { icon: 'savings', titleKey: 'HOME.VALUE_PROP.ITEMS.PRICE.TITLE', descKey: 'HOME.VALUE_PROP.ITEMS.PRICE.DESC', highlight: true },
        { icon: 'verified', titleKey: 'HOME.VALUE_PROP.ITEMS.REVENUE.TITLE', descKey: 'HOME.VALUE_PROP.ITEMS.REVENUE.DESC', highlight: true },
        { icon: 'schedule', titleKey: 'HOME.VALUE_PROP.ITEMS.FLEX.TITLE', descKey: 'HOME.VALUE_PROP.ITEMS.FLEX.DESC', highlight: false },
        { icon: 'handshake', titleKey: 'HOME.VALUE_PROP.ITEMS.MICRO.TITLE', descKey: 'HOME.VALUE_PROP.ITEMS.MICRO.DESC', highlight: false }
    ];

    private authService = inject(AuthService);
    currentUser = this.authService.currentUser;

    ngOnInit() {
        this.initScrollProgress();
        this.loadRecentServices();
        this.animateStats();

        // Typed Text Translation
        this.updateTypedTexts();
        this.langChangeSub = this.translate.onLangChange.subscribe(() => {
            this.updateTypedTexts();
        });
    }

    updateTypedTexts() {
        this.translate.get(this.typedTextsKeys).subscribe(translations => {
            this.translatedTexts = this.typedTextsKeys.map(key => translations[key]);
            this.cdr.markForCheck();
        });
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
                this.cdr.markForCheck();
            }, intervalTime);
        });
    }

    ngOnDestroy() {
        if (this.scrollListener) {
            this.scrollListener();
        }
        if (this.langChangeSub) {
            this.langChangeSub.unsubscribe();
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
        this.isLoading.set(true);
        this.serviceService.getAllServices({ limit: 8 }).subscribe({
            next: (response: any) => {
                // Backend returns: { results: number, data: { services: [...] } }
                this.recentServices.set(response.data?.services || []);
                this.logger.info(`Loaded ${this.recentServices().length} services`);
                this.isLoading.set(false);
            },
            error: (error) => {
                this.logger.error('Error loading services:', error);
                this.isLoading.set(false);
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
