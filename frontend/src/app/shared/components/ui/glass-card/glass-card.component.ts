import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-glass-card',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="glass-card" [class.hoverable]="hoverable">
            <ng-content></ng-content>
        </div>
    `,
    styles: [`
        .glass-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 16px;
            padding: 24px;
            box-shadow: 
                0 8px 32px rgba(0, 0, 0, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.3);
            transition: all 0.3s ease;
        }

        .glass-card.hoverable:hover {
            background: rgba(255, 255, 255, 0.15);
            border-color: rgba(255, 255, 255, 0.3);
            box-shadow: 
                0 12px 40px rgba(0, 0, 0, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 0.4);
            transform: translateY(-4px);
        }

        /* Dark mode variant */
        :host-context(.dark) .glass-card {
            background: rgba(0, 0, 0, 0.3);
            border-color: rgba(255, 255, 255, 0.1);
        }
    `]
})
export class GlassCardComponent {
    @Input() hoverable: boolean = false;
}
