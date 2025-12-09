import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-typed-text',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './typed-text.component.html',
    styleUrls: ['./typed-text.component.scss']
})
export class TypedTextComponent implements OnInit, OnDestroy {
    @Input() texts: string[] = [];
    @Input() typeSpeed = 100;
    @Input() backSpeed = 50;
    @Input() loop = true;

    displayText = '';
    private currentTextIndex = 0;
    private isDeleting = false;
    private timeoutId: any;

    ngOnInit() {
        this.type();
    }

    ngOnDestroy() {
        clearTimeout(this.timeoutId);
    }

    private type() {
        const currentFullText = this.texts[this.currentTextIndex];

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
