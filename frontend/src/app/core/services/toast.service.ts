import { Injectable, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

/**
 * Toast Service - Clean wrapper around ngx-toastr
 * Provides consistent toast notifications across the app
 */
@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private toastr = inject(ToastrService);

    /**
     * Success notification (green)
     */
    success(message: string, title: string = 'Succès'): void {
        this.toastr.success(message, title);
    }

    /**
     * Error notification (red)
     */
    error(message: string, title: string = 'Erreur'): void {
        this.toastr.error(message, title);
    }

    /**
     * Warning notification (orange)
     */
    warning(message: string, title: string = 'Attention'): void {
        this.toastr.warning(message, title);
    }

    /**
     * Info notification (blue)
     */
    info(message: string, title: string = 'Info'): void {
        this.toastr.info(message, title);
    }

    /**
     * Clear all active toasts
     */
    clear(): void {
        this.toastr.clear();
    }
}
