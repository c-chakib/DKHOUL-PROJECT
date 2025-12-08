import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-empty-state',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
        <div class="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
            <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span class="text-5xl">{{ icon }}</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">{{ title }}</h3>
            <p class="text-gray-500 mb-6 max-w-md mx-auto">{{ message }}</p>
            <a *ngIf="actionLink" 
               [routerLink]="actionLink" 
               class="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors">
                {{ actionText }} →
            </a>
        </div>
    `
})
export class EmptyStateComponent {
    @Input() icon: string = '📭';
    @Input() title: string = 'Rien à afficher';
    @Input() message: string = "Il n'y a aucun élément à afficher pour le moment.";
    @Input() actionText: string = 'Explorer';
    @Input() actionLink: string = '';
}
