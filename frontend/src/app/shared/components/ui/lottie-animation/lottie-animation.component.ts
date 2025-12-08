import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';

@Component({
    selector: 'app-lottie-animation',
    standalone: true,
    imports: [CommonModule, LottieComponent],
    template: `
        <div [style.width]="width" [style.height]="height">
            <ng-lottie [options]="options" [width]="width" [height]="height"></ng-lottie>
        </div>
    `,
    styles: [`
        :host {
            display: inline-block;
        }
    `]
})
export class LottieAnimationComponent {
    @Input() path: string = '';
    @Input() width: string = '200px';
    @Input() height: string = '200px';
    @Input() loop: boolean = true;
    @Input() autoplay: boolean = true;

    get options(): AnimationOptions {
        return {
            path: this.path,
            loop: this.loop,
            autoplay: this.autoplay
        };
    }
}
