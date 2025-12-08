import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
    selector: '[appCountUp]',
    standalone: true
})
export class CountUpDirective implements OnInit, OnDestroy {
    @Input('appCountUp') targetValue: number = 0;
    @Input() duration: number = 2000;
    @Input() prefix: string = '';
    @Input() suffix: string = '';

    private observer: IntersectionObserver | undefined;

    constructor(private el: ElementRef, private renderer: Renderer2) { }

    ngOnInit() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCount();
                    this.observer?.disconnect();
                }
            });
        });
        this.observer.observe(this.el.nativeElement);
    }

    private animateCount() {
        const start = 0;
        const end = this.targetValue;
        const startTime = Date.now();

        const update = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / this.duration, 1);

            // Easing function (easeOutExpo)
            const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

            const current = Math.floor(start + (end - start) * ease);

            // Handle floating point for ratings if needed, currently assumes integer unless customized
            const displayValue = Number.isInteger(this.targetValue) ? current : current.toFixed(1);

            this.renderer.setProperty(this.el.nativeElement, 'textContent', `${this.prefix}${displayValue}${this.suffix}`);

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                // Ensure final value is exact
                this.renderer.setProperty(this.el.nativeElement, 'textContent', `${this.prefix}${this.targetValue}${this.suffix}`);
            }
        };

        requestAnimationFrame(update);
    }

    ngOnDestroy() {
        this.observer?.disconnect();
    }
}
