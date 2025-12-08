import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const user = authService.currentUser();

    // Get expected roles from route data
    const expectedRoles = route.data['roles'] as Array<string>;

    if (!user) {
        return router.createUrlTree(['/login']);
    }

    if (expectedRoles && expectedRoles.includes(user.role)) {
        return true;
    }

    // Redirect to dashboard if unauthorized
    return router.createUrlTree(['/dashboard']);
};
