import { Injectable, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

/**
 * Toast Service - Clean wrapper around ngx-toastr
 * Provides consistent toast notifications across the app
 */
@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private toastr = inject(ToastrService);
    private translate = inject(TranslateService);

    /**
     * Success notification
     */
    success(message: string, title?: string): void {
        this.toastr.success(
            this.translate.instant(message),
            title ? this.translate.instant(title) : this.translate.instant('TOASTS.SUCCESS')
        );
    }

    /**
     * Error notification
     */
    error(message: string, title?: string): void {
        this.toastr.error(
            this.translate.instant(message),
            title ? this.translate.instant(title) : this.translate.instant('TOASTS.ERROR')
        );
    }

    /**
     * Warning notification
     */
    warning(message: string, title?: string): void {
        this.toastr.warning(
            this.translate.instant(message),
            title ? this.translate.instant(title) : this.translate.instant('TOASTS.WARNING')
        );
    }

    /**
     * Info notification
     */
    info(message: string, title?: string): void {
        this.toastr.info(
            this.translate.instant(message),
            title ? this.translate.instant(title) : this.translate.instant('TOASTS.INFO')
        );
    }

    /**
     * Clear all active toasts
     */
    clear(): void {
        this.toastr.clear();
    }
}
