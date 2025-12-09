import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-hero-carousel',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './hero-carousel.component.html',
    styleUrls: ['./hero-carousel.component.scss']
})
export class HeroCarouselComponent implements OnInit, OnDestroy {
    @Input() images: { src: string, alt: string }[] = [];
    currentSlide = 0;
    private intervalId: any;

    ngOnInit() {
        this.intervalId = setInterval(() => {
            this.currentSlide = (this.currentSlide + 1) % this.images.length;
        }, 5000);
    }

    ngOnDestroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }
}
