import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-typed-text',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './typed-text.component.html',
    styleUrls: ['./typed-text.component.scss']
})
export class TypedTextComponent implements OnInit, OnDestroy, OnChanges {
    @Input() texts: string[] = [];
    @Input() typeSpeed = 100;
    @Input() backSpeed = 50;
    @Input() loop = true;

    displayText = '';
    private currentTextIndex = 0;
    private isDeleting = false;
    private timeoutId: any;

    ngOnInit() {
        // Initial check, but real trigger usually comes from ngOnChanges for async data
        if (this.texts && this.texts.length > 0) {
            this.type();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['texts'] && this.texts && this.texts.length > 0) {
            // Restart typing if texts change significantly or populate for first time
            clearTimeout(this.timeoutId);
            this.currentTextIndex = 0;
            this.isDeleting = false;
            this.displayText = '';
            this.type();
        }
    }

    ngOnDestroy() {
        clearTimeout(this.timeoutId);
    }

    private type() {
        // Double check availability
        if (!this.texts || this.texts.length === 0) return;

        const currentFullText = this.texts[this.currentTextIndex];
        if (!currentFullText) return;

        if (this.isDeleting) {
            this.displayText = currentFullText.substring(0, this.displayText.length - 1);
        } else {
            this.displayText = currentFullText.substring(0, this.displayText.length + 1);
        }

        let typeSpeed = this.isDeleting ? this.backSpeed : this.typeSpeed;

        if (!this.isDeleting && this.displayText === currentFullText) {
            typeSpeed = 2000; // Pause at end
            this.isDeleting = true;
        } else if (this.isDeleting && this.displayText === '') {
            this.isDeleting = false;
            this.currentTextIndex = (this.currentTextIndex + 1) % this.texts.length;
            if (!this.loop && this.currentTextIndex === 0) return; // Stop if no loop
        }

        this.timeoutId = setTimeout(() => this.type(), typeSpeed);
    }
}
