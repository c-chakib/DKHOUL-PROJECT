import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-hero-carousel',
    standalone: true,
    imports: [CommonModule, TranslateModule, NgOptimizedImage],
    templateUrl: './hero-carousel.component.html',
    styleUrls: ['./hero-carousel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroCarouselComponent implements OnInit, OnDestroy {
    @Input() images: { src: string, alt: string }[] = [];
    currentSlide = signal(0);
    private intervalId: any;

    ngOnInit() {
        this.intervalId = setInterval(() => {
            if (this.images.length > 0) {
                this.currentSlide.update(v => (v + 1) % this.images.length);
            }
        }, 5000);
    }

    ngOnDestroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }
}
