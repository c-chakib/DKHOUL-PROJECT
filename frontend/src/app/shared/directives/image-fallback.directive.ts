import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: 'img[appImageFallback]',
    standalone: true
})
export class ImageFallbackDirective {
    @Input() appImageFallback = '/assets/images/placeholder-service.png';
    private isFallbackApplied = false;

    constructor(private el: ElementRef) { }

    @HostListener('error') onError() {
        if (!this.isFallbackApplied) {
            this.isFallbackApplied = true;
            this.el.nativeElement.src = this.appImageFallback;
        }
    }
}
