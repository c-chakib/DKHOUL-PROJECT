import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
    fb = inject(FormBuilder);
    authService = inject(AuthService);
    router = inject(Router);

    registerForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        passwordConfirm: ['', [Validators.required]],
        role: ['tourist', [Validators.required]] // Default to tourist
    });

    errorMsg = '';
    loading = false;

    onSubmit() {
        if (this.registerForm.valid) {
            if (this.registerForm.value.password !== this.registerForm.value.passwordConfirm) {
                this.errorMsg = 'Les mots de passe ne correspondent pas.';
                return;
            }

            this.loading = true;
            this.errorMsg = '';

            this.authService.register(this.registerForm.value).subscribe({
                next: () => {
                    this.router.navigate(['/']);
                },
                error: (err) => {
                    this.loading = false;
                    this.errorMsg = err.error?.message || "Une erreur est survenue lors de l'inscription.";
                }
            });
        } else {
            this.registerForm.markAllAsTouched();
        }
    }
}
