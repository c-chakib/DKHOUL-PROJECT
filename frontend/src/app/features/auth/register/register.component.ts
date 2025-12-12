import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

import { ToastrService } from 'ngx-toastr';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
    fb = inject(FormBuilder);
    authService = inject(AuthService);
    router = inject(Router);
    toastr = inject(ToastrService);
    translate = inject(TranslateService);

    registerForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [
            Validators.required,
            Validators.minLength(12),
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/)
        ]],
        passwordConfirm: ['', [Validators.required]],
        role: ['tourist', [Validators.required]] // Default to tourist
    });

    errorMsg = '';
    loading = false;

    onSubmit() {
        if (this.registerForm.valid) {
            if (this.registerForm.value.password !== this.registerForm.value.passwordConfirm) {
                this.errorMsg = this.translate.instant('AUTH.ERRORS.PASSWORD_MISMATCH');
                return;
            }

            this.loading = true;
            this.errorMsg = '';

            this.authService.register(this.registerForm.value).subscribe({
                next: () => {
                    this.toastr.success(this.translate.instant('AUTH.SUCCESS_REGISTER'), this.translate.instant('TOASTS.SUCCESS'));
                    this.router.navigate(['/']);
                },
                error: (err) => {
                    this.loading = false;
                    this.errorMsg = err.error?.message || this.translate.instant('TOASTS.NETWORK_ERROR');
                    this.toastr.error(this.errorMsg, this.translate.instant('TOASTS.ERROR'));
                }
            });
        } else {
            this.registerForm.markAllAsTouched();
        }
    }
}
