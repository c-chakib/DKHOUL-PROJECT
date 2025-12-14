import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-hero-carousel',
    standalone: true,
    imports: [CommonModule, TranslateModule, NgOptimizedImage],
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
