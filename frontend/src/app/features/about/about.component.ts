import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-about',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './about.component.html'
})
export class AboutComponent {
    pillars = [
        {
            icon: 'space',
            color: 'bg-amber-500',
            title: 'SPACE',
            subtitle: 'Des lieux uniques.',
            description: 'Des riads centenaires aux kasbahs perchées, nous sélectionnons des espaces authentiques qui racontent l\'histoire du Maroc.'
        },
        {
            icon: 'skill',
            color: 'bg-teal-600',
            title: 'SKILL',
            subtitle: 'Un savoir-faire vivant.',
            description: 'Artisans, cuisiniers, guides : des passionnés qui transmettent leur art avec générosité et fierté.'
        },
        {
            icon: 'connect',
            color: 'bg-orange-500',
            title: 'CONNECT',
            subtitle: 'Des rencontres humaines.',
            description: 'Plus qu\'un service, une invitation à partager des moments de vie, à créer des liens durables.'
        }
    ];
}
