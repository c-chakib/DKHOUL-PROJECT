import { Component, OnInit, signal, inject, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ServiceService, Service } from '../../core/services/service.service';
import { MapComponent } from '../../shared/components/map/map.component';
import { environment } from '../../../environments/environment';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { MatIconModule } from '@angular/material/icon';

import { WebpUrlPipe } from '../../shared/pipes/webp-url.pipe';

@Component({
    selector: 'app-marketplace',
    standalone: true,
    imports: [CommonModule, MapComponent, FormsModule, MatIconModule, WebpUrlPipe],
    templateUrl: './marketplace.component.html',
    styleUrls: ['./marketplace.component.scss']
})
export class MarketplaceComponent implements OnInit, OnDestroy {
    private serviceService = inject(ServiceService);
    private router = inject(Router);

    // Search Debounce Subject
    private searchSubject = new Subject<string>();
    private destroy$ = new Subject<void>();

    services = signal<Service[]>([]);
    mapServices = signal<Service[]>([]); // Full dataset for map
    total = signal<number>(0);
    currentPage = signal<number>(1);
    limit = 9;

    selectedCategory = signal<string>('');
    sortOption = signal<string>('');
    viewMode = signal<'list' | 'map'>('list');
    isLoading = signal<boolean>(true);

    totalPages = computed(() => Math.ceil(this.total() / this.limit));

    visiblePages = computed(() => {
        const total = this.totalPages();
        const current = this.currentPage();
        const delta = 2; // Number of pages to show before and after current
        const range = [];

        for (let i = 1; i <= total; i++) {
            if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
                range.push(i);
            } else if (range[range.length - 1] !== -1) {
                range.push(-1); // Identifier for spacer '...'
            }
        }
        return range;
    });

    searchQuery = signal<string>('');
    selectedCity = signal<string>('');
    minPrice = signal<number | null>(null);
    maxPrice = signal<number | null>(null);

    // Filter Options
    cities = ['Tout le Maroc', 'Casablanca', 'Marrakech', 'Agadir', 'Tanger', 'Fès', 'Rabat', 'Essaouira', 'Merzouga', 'Chefchaouen', 'Ouarzazate'];

    categories = [
        { value: '', label: 'All' },
        { value: 'SPACE', label: 'Spaces' },
        { value: 'SKILL', label: 'Skills' },
        { value: 'CONNECT', label: 'Connect' }
    ];

    sortOptions = [
        { value: '', label: 'Trier par défault' },
        { value: 'price', label: 'Prix croissant' },
        { value: '-price', label: 'Prix décroissant' },
        { value: '-rating', label: 'Mieux notés' }
    ];

    private route = inject(ActivatedRoute);

    ngOnInit() {
        // Initialize Search Subscription
        this.searchSubject.pipe(
            debounceTime(400), // Wait 400ms after last keystroke
            distinctUntilChanged(), // Only if value changed
            takeUntil(this.destroy$)
        ).subscribe(query => {
            this.searchQuery.set(query);
            this.triggerSearch();
        });

        this.route.queryParams.subscribe(params => {
            if (params['category']) {
                this.selectedCategory.set(params['category']);
            }
            if (params['search']) {
                this.searchQuery.set(params['search']);
            }
            this.fetchServices();
            this.fetchMapServices();
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // Map Fetch (All results matching filters)
    fetchMapServices() {
        const params: any = {
            limit: 1000 // High limit to get all for map
        };
        this.applyFilters(params);
        this.serviceService.getAllServices(params).subscribe({
            next: (res) => {
                if (res.data && res.data.services) {
                    this.mapServices.set(res.data.services);
                }
            },
            error: (err) => console.error('Error fetching map services:', err)
        });
    }

    fetchServices() {
        this.isLoading.set(true);
        const params: any = {
            page: this.currentPage(),
            limit: this.limit
        };
        this.applyFilters(params);

        this.serviceService.getAllServices(params).subscribe({
            next: (res) => {
                if (res.data && res.data.services) {
                    this.services.set(res.data.services);
                    this.total.set(res.total || 0);
                }
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Error fetching services:', err);
                this.isLoading.set(false);
            }
        });
    }

    private applyFilters(params: any) {
        if (this.selectedCategory()) params.category = this.selectedCategory();
        if (this.sortOption()) params.sort = this.sortOption();
        if (this.searchQuery()) params.search = this.searchQuery();
        if (this.selectedCity() && this.selectedCity() !== 'Tout le Maroc') params.city = this.selectedCity();
        if (this.minPrice()) params['price[gte]'] = this.minPrice();
        if (this.maxPrice()) params['price[lte]'] = this.maxPrice();
    }

    onSearchInput(event: Event) {
        const val = (event.target as HTMLInputElement).value;
        this.searchSubject.next(val);
    }

    triggerSearch() {
        this.currentPage.set(1);
        this.fetchServices();
        this.fetchMapServices();
    }

    onCityChange(event: Event) {
        const val = (event.target as HTMLSelectElement).value;
        this.selectedCity.set(val);
        this.triggerSearch();
    }

    onPriceChange() {
        this.triggerSearch();
    }

    resetFilters() {
        this.searchQuery.set('');
        this.selectedCity.set('');
        this.selectedCategory.set('');
        this.minPrice.set(null);
        this.maxPrice.set(null);
        this.sortOption.set('');
        this.searchSubject.next(''); // Clear debounce subject
        this.triggerSearch();
    }

    onPageChange(newPage: number) {
        if (newPage >= 1 && newPage <= this.totalPages()) {
            this.currentPage.set(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            this.fetchServices();
        }
    }

    onCategoryChange(category: string) {
        this.selectedCategory.set(category);
        this.currentPage.set(1); // Reset to page 1 on filter change
        this.fetchServices();
        this.fetchMapServices();
    }

    onSortChange(event: Event) {
        const value = (event.target as HTMLSelectElement).value;
        this.sortOption.set(value);
        this.currentPage.set(1); // Reset to page 1 on sort change
        this.fetchServices();
        this.fetchMapServices();
    }

    setViewMode(mode: 'list' | 'map') {
        this.viewMode.set(mode);
    }

    navigateToService(service: any) {
        this.router.navigate(['/service', service._id || service.id]);
    }

    getImageUrl(url: string | undefined): string | null {
        if (!url) return null;
        if (url.startsWith('data:')) return url;
        if (url.startsWith('http')) return url;
        if (url.startsWith('/assets')) return url;
        if (url.startsWith('/uploads')) {
            return environment.apiUrl.replace('/api/v1', '') + url;
        }
        return url;
    }
}
