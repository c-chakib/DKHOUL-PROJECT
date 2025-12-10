import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'tourist' | 'host' | 'admin' | 'superadmin';
    photo?: string;
    bio?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private apiUrl = `${environment.apiUrl}/users`;

    // Signal for current user state
    private currentUserSignal = signal<User | null>(null);

    // Computed signal for checking if logged in
    isAuthenticated = computed(() => !!this.currentUserSignal());

    // Computed signal for getting user role
    userRole = computed(() => this.currentUserSignal()?.role);

    constructor() {
        // Try to load user from storage on init
        this.loadUserFromStorage();
    }

    // --- API METHODS ---

    login(credentials: { email: string; password: string }) {
        return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
            tap(response => {
                if (response.status === 'success') {
                    this.handleAuthSuccess(response.token, response.data.user);
                }
            })
        );
    }

    register(data: any) {
        return this.http.post<any>(`${this.apiUrl}/signup`, data).pipe(
            tap(response => {
                if (response.status === 'success') {
                    this.handleAuthSuccess(response.token, response.data.user);
                }
            })
        );
    }

    loginWithGoogle(googleToken: string, extraData?: any) {
        return this.http.post<any>(`${this.apiUrl}/google-login`, { googleToken, ...extraData }).pipe(
            tap(response => {
                if (response.status === 'success') {
                    this.handleAuthSuccess(response.token, response.data.user);
                }
            })
        );
    }

    initGoogleAuth() {
        // Placeholder for Google Auth Initialization
        // In a real implementation, this would load the GSI script and initialize the client
        if (typeof window !== 'undefined' && (window as any).google) {
            // (window as any).google.accounts.id.initialize(...)
        }
    }

    // --- HELPER METHODS ---

    private handleAuthSuccess(token: string, user: User) {
        this.setToken(token);
        this.setUser(user);
    }

    private setToken(token: string) {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('token', token);
        }
    }

    // Set user (e.g., after login)
    setUser(user: User) {
        this.currentUserSignal.set(user);
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(user));
        }
    }

    // Clear user (logout)
    logout() {
        this.currentUserSignal.set(null);
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
        this.router.navigate(['/']);
    }

    private loadUserFromStorage() {
        if (typeof localStorage !== 'undefined') {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (token && storedUser) {
                // Optimistic load
                try {
                    this.currentUserSignal.set(JSON.parse(storedUser));
                    // Verify with backend
                    this.verifyToken();
                } catch (e) {
                    console.error('Failed to parse user from storage');
                    this.logout();
                }
            }
        }
    }

    // Verify token validity with backend
    verifyToken() {
        this.http.get<any>(`${this.apiUrl}/me`).subscribe({
            next: (res) => {
                // Token valid, update user data if changed
                if (res.data && res.data.user) {
                    this.setUser(res.data.user);
                }
            },
            error: (err) => {
                console.error('Token invalid or user deleted:', err);
                this.logout();
            }
        });
    }

    // Get raw signal (if needed)
    get currentUser() {
        return this.currentUserSignal.asReadonly();
    }
}
