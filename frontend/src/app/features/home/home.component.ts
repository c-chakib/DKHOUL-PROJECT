import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ServiceService } from '../../core/services/service.service';
import { CountUpDirective } from '../../shared/directives/count-up.directive';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, CountUpDirective],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    private router = inject(Router);
    private serviceService = inject(ServiceService);

    searchText = signal('');
    featuredServices = signal<any[]>([]);
    isLoading = signal(true);

    categories = [
        { label: 'Espaces (Space)', icon: '🏠', value: 'SPACE' },
        { label: 'Ateliers (Skill)', icon: '🎨', value: 'SKILL' },
        { label: 'Rencontres (Connect)', icon: '🤝', value: 'CONNECT' }
    ];

    ngOnInit() {
        this.fetchFeaturedServices();
    }

    fetchFeaturedServices() {
        this.isLoading.set(true);
        this.serviceService.getAllServices().subscribe({
            next: (res) => {
                // API returns { results: number, data: { services: Service[] } }
                const services = res.data?.services || [];
                // Take only the first 6 services
                this.featuredServices.set(services.slice(0, 6));
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Failed to fetch services', err);
                this.isLoading.set(false);
            }
        });
    }



    onSearch() {
        if (this.searchText().trim()) {
            this.router.navigate(['/marketplace'], { queryParams: { q: this.searchText() } });
        }
    }
}
