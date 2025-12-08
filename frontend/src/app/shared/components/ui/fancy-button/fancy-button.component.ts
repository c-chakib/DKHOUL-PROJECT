import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-fancy-button',
    standalone: true,
    imports: [CommonModule],
    template: `
        <button 
            class="fancy-button"
            [class.loading]="loading"
            [disabled]="disabled || loading"
            (click)="handleClick()">
            <span class="button-content">
                @if (loading) {
                    <span class="spinner"></span>
                }
                <span class="label">{{ label }}</span>
            </span>
            <span class="button-glow"></span>
        </button>
    `,
    styles: [`
        .fancy-button {
            position: relative;
            padding: 14px 32px;
            font-size: 16px;
            font-weight: 700;
            color: white;
            background: linear-gradient(135deg, #D4A574 0%, #CD853F 50%, #8B4513 100%);
            border: none;
            border-radius: 12px;
            cursor: pointer;
            overflow: hidden;
            transition: all 0.3s ease;
            box-shadow: 
                0 4px 15px rgba(212, 165, 116, 0.4),
                0 8px 30px rgba(139, 69, 19, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.2);
            transform: translateY(0);
        }

        .fancy-button:hover:not(:disabled) {
            transform: translateY(-3px);
            box-shadow: 
                0 8px 25px rgba(212, 165, 116, 0.5),
                0 15px 40px rgba(139, 69, 19, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        .fancy-button:active:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 
                0 4px 15px rgba(212, 165, 116, 0.4),
                0 8px 20px rgba(139, 69, 19, 0.2);
        }

        .fancy-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }

        .button-content {
            position: relative;
            z-index: 1;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .button-glow {
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            transition: left 0.5s ease;
        }

        .fancy-button:hover:not(:disabled) .button-glow {
            left: 100%;
        }

        .spinner {
            width: 18px;
            height: 18px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `]
})
export class FancyButtonComponent {
    @Input() label: string = 'Button';
    @Input() loading: boolean = false;
    @Input() disabled: boolean = false;
    @Output() onClick = new EventEmitter<void>();

    handleClick() {
        if (!this.loading && !this.disabled) {
            this.onClick.emit();
        }
    }
}
