import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

/**
 * Global HTTP Error Interceptor
 * Handles server errors and redirects to appropriate error pages
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const toast = inject(ToastService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let errorMessage = 'Une erreur est survenue';

            switch (error.status) {
                case 0:
                    // Server down or network error
                    toast.error('Connexion perdue. Vérifiez votre connexion internet.', 'Erreur réseau');
                    break;

                case 401:
                    // Unauthorized - JWT expired or not logged in
                    toast.warning('Session expirée. Veuillez vous reconnecter.');
                    router.navigate(['/login']);
                    break;

                case 403:
                    // Forbidden
                    toast.error("Vous n'avez pas les permissions nécessaires.", 'Accès refusé');
                    router.navigate(['/error'], { queryParams: { type: '403' } });
                    break;

                case 404:
                    // Not found - Let API 404s pass through (they're expected for missing data)
                    // Only redirect for navigation 404s
                    if (!req.url.includes('/api/')) {
                        router.navigate(['/error'], { queryParams: { type: '404' } });
                    }
                    break;

                case 500:
                    // Server Error
                    toast.error('Le serveur rencontre un problème. Réessayez plus tard.', 'Erreur serveur');
                    break;

                case 502:
                case 503:
                case 504:
                    // Gateway/Service errors
                    toast.error('Service temporairement indisponible.', 'Maintenance');
                    break;

                default:
                    // Other errors
                    if (error.error?.message) {
                        errorMessage = error.error.message;
                    }
                    toast.error(errorMessage);
            }

            return throwError(() => error);
        })
    );
};
