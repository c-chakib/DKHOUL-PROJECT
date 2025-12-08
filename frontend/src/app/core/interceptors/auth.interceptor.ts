import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    // Check if we have a token in localStorage
    // We need to be careful with SSR, so we check if localStorage is defined
    let token = null;
    if (typeof localStorage !== 'undefined') {
        token = localStorage.getItem('token');
    }

    if (token) {
        const cloned = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        return next(cloned);
    }

    return next(req);
};
