import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-report-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
        <div *ngIf="isOpen()" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <!-- Backdrop -->
            <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" (click)="close()"></div>
            
            <!-- Modal -->
            <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all">
                <!-- Header -->
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                        🚩 Signaler ce service
                    </h2>
                    <button (click)="close()" class="text-gray-400 hover:text-gray-600 text-2xl">
                        ×
                    </button>
                </div>

                <!-- Reasons -->
                <div class="space-y-3 mb-6">
                    <label *ngFor="let reason of reasons" 
                           class="flex items-center p-3 rounded-lg border cursor-pointer transition-all"
                           [class.border-red-500]="selectedReason() === reason.value"
                           [class.bg-red-50]="selectedReason() === reason.value"
                           [class.border-gray-200]="selectedReason() !== reason.value">
                        <input type="radio" 
                               [value]="reason.value" 
                               name="reason"
                               [checked]="selectedReason() === reason.value"
                               (change)="selectedReason.set(reason.value)"
                               class="w-4 h-4 text-red-600 focus:ring-red-500">
                        <span class="ml-3 text-gray-700">{{ reason.label }}</span>
                    </label>
                </div>

                <!-- Details -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Détails supplémentaires (optionnel)
                    </label>
                    <textarea 
                        [(ngModel)]="details"
                        rows="3"
                        placeholder="Décrivez le problème en détail..."
                        class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none">
                    </textarea>
                </div>

                <!-- Actions -->
                <div class="flex gap-3">
                    <button (click)="close()" 
                            class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">
                        Annuler
                    </button>
                    <button (click)="submit()" 
                            [disabled]="!selectedReason() || isSubmitting()"
                            class="flex-1 px-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {{ isSubmitting() ? 'Envoi...' : 'Envoyer le signalement' }}
                    </button>
                </div>
            </div>
        </div>
    `
})
export class ReportModalComponent {
    private http = inject(HttpClient);
    private toast = inject(ToastService);
    private authService = inject(AuthService);

    @Input() targetId: string = '';
    @Input() targetType: 'service' | 'user' = 'service';
    @Output() closed = new EventEmitter<void>();
    @Output() submitted = new EventEmitter<void>();

    isOpen = signal(false);
    selectedReason = signal<string>('');
    details: string = '';
    isSubmitting = signal(false);

    reasons = [
        { value: 'inappropriate', label: 'Contenu inapproprié' },
        { value: 'fake_profile', label: 'Faux profil' },
        { value: 'scam', label: 'Arnaque / Fraude' },
        { value: 'other', label: 'Autre' }
    ];

    open() {
        if (!this.authService.currentUser()) {
            this.toast.info('Veuillez vous connecter pour signaler');
            return;
        }
        this.isOpen.set(true);
    }

    close() {
        this.isOpen.set(false);
        this.selectedReason.set('');
        this.details = '';
        this.closed.emit();
    }

    submit() {
        if (!this.selectedReason()) {
            this.toast.warning('Veuillez sélectionner une raison');
            return;
        }

        this.isSubmitting.set(true);

        const reportData = {
            targetType: this.targetType,
            targetId: this.targetId,
            reason: this.selectedReason(),
            details: this.details
        };

        this.http.post(`${environment.apiUrl}/admin/reports`, reportData).subscribe({
            next: () => {
                this.toast.success('Signalement envoyé. Merci pour votre vigilance.');
                this.isSubmitting.set(false);
                this.submitted.emit();
                this.close();
            },
            error: (err) => {
                this.toast.error(err.error?.message || 'Erreur lors du signalement');
                this.isSubmitting.set(false);
            }
        });
    }
}
