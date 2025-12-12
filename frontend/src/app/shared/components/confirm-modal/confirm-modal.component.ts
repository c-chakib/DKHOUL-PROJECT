import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" (click)="onCancel()"></div>
        
        <!-- Modal Content -->
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all scale-100 p-6">
          
          <!-- Icon -->
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4"
               [ngClass]="type === 'danger' ? 'bg-red-100' : 'bg-green-100'">
            @if (type === 'danger') {
              <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            } @else {
              <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            }
          </div>

          <!-- Text -->
          <div class="text-center mb-6">
            <h3 class="text-lg font-bold text-gray-900 mb-2">{{ title }}</h3>
            <p class="text-sm text-gray-500">{{ message }}</p>
          </div>

          <!-- Buttons -->
          <div class="flex gap-3 justify-center">
            <button (click)="onCancel()" 
                    class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
              {{ cancelText }}
            </button>
            <button (click)="onConfirm()" 
                    class="px-4 py-2 text-white rounded-lg font-bold transition-colors shadow-lg"
                    [ngClass]="type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'">
              {{ confirmText }}
            </button>
          </div>

        </div>
      </div>
    }
  `
})
export class ConfirmModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirmation';
  @Input() message = 'Are you sure?';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() type: 'success' | 'danger' | 'warning' = 'success';

  @Output() confirmEvent = new EventEmitter<void>();
  @Output() cancelEvent = new EventEmitter<void>();

  onConfirm() {
    this.confirmEvent.emit();
  }

  onCancel() {
    this.cancelEvent.emit();
  }
}
