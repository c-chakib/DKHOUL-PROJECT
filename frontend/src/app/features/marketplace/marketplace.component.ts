import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ServiceService, Service } from '../../core/services/service.service';
import { MapComponent } from '../../shared/components/map/map.component';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-marketplace',
    standalone: true,
    imports: [CommonModule, MapComponent],
    templateUrl: './marketplace.component.html',
    styleUrls: ['./marketplace.component.scss']
})
export class MarketplaceComponent implements OnInit {
    private serviceService = inject(ServiceService);
    private router = inject(Router);

    services = signal<Service[]>([]);
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

    categories = [
        { value: '', label: 'Tout' },
        { value: 'SPACE', label: 'Espaces' },
        { value: 'SKILL', label: 'Compétences' },
        { value: 'CONNECT', label: 'Connexions' }
    ];

    sortOptions = [
        { value: '', label: 'Trier par défault' },
        { value: 'price', label: 'Prix croissant' },
        { value: '-price', label: 'Prix décroissant' },
        { value: '-rating', label: 'Mieux notés' }
    ];

    ngOnInit() {
        this.fetchServices();
    }

    fetchServices() {
        this.isLoading.set(true);
        const params: any = {
            page: this.currentPage(),
            limit: this.limit
        };

        if (this.selectedCategory()) params.category = this.selectedCategory();
        if (this.sortOption()) params.sort = this.sortOption();

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
    }

    onSortChange(event: Event) {
        const value = (event.target as HTMLSelectElement).value;
        this.sortOption.set(value);
        this.currentPage.set(1); // Reset to page 1 on sort change
        this.fetchServices();
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
        if (url.startsWith('/uploads')) {
            return environment.apiUrl.replace('/api/v1', '') + url;
        }
        return url;
    }
}
