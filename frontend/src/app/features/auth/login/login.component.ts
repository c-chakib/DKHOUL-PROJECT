import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    fb = inject(FormBuilder);
    authService = inject(AuthService);
    router = inject(Router);
    toast = inject(ToastService);

    loginForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]]
    });

    errorMsg = '';
    loading = false;

    ngOnInit() {
        // @ts-ignore
        if (typeof google !== 'undefined') {
            // @ts-ignore
            google.accounts.id.initialize({
                client_id: '717075008014-bbl56i0q4rchqtblsmn4fmkufvq0fhb6.apps.googleusercontent.com',
                callback: (response: any) => this.handleGoogleCredential(response)
            });
            // @ts-ignore
            google.accounts.id.renderButton(
                document.getElementById("google-button-div"),
                { theme: "outline", size: "large" }
            );

        }
    }

    handleGoogleCredential(response: any) {
        if (response.credential) {
            const payload = this.decodeJwt(response.credential);
            if (payload) {
                const userData = {
                    email: payload.email,
                    name: payload.name,
                    photoUrl: payload.picture
                };

                this.authService.loginWithGoogle(response.credential, userData).subscribe({
                    next: () => {
                        this.toast.success('Bienvenue !', 'Connexion réussie');
                        this.router.navigate(['/']);
                    },
                    error: (err) => {
                        this.toast.error('Erreur lors de la connexion Google.');
                        this.errorMsg = 'Erreur Google Login.';
                    }
                });
            }
        }
    }

    onSubmit() {
        if (this.loginForm.valid) {
            this.loading = true;
            this.errorMsg = '';

            this.authService.login(this.loginForm.value as any).subscribe({
                next: () => {
                    this.loading = false;
                    this.toast.success('Bienvenue !', 'Connexion réussie');
                    // Small delay to ensure toast is visible before navigation
                    setTimeout(() => {
                        this.router.navigate(['/']);
                    }, 500);
                },
                error: (err) => {
                    this.loading = false;
                    this.toast.error('Identifiants incorrects');
                    this.errorMsg = err.error?.message || 'Une erreur est survenue lors de la connexion.';
                }
            });
        } else {
            this.loginForm.markAllAsTouched();
        }
    }

    loginWithGoogle() {
        console.log("Please use the rendered Google Button.");
    }

    private decodeJwt(token: string): any {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error("Failed to decode JWT", e);
            return null;
        }
    }
}
