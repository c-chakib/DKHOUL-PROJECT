import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: 'img[appImageFallback]',
    standalone: true
})
export class ImageFallbackDirective {
    @Input() appImageFallback = 'assets/images/placeholder.jpg';

    constructor(private el: ElementRef) { }

    @HostListener('error') onError() {
        this.el.nativeElement.src = this.appImageFallback;
    }
}
