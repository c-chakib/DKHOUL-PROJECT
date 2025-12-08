import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
    private fb = inject(FormBuilder);
    private userService = inject(UserService);
    private toast = inject(ToastService);

    form = this.fb.group({
        email: ['', [Validators.required, Validators.email]]
    });

    loading = signal(false);
    emailSent = signal(false);

    onSubmit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.loading.set(true);
        this.userService.forgotPassword(this.form.value.email || '').subscribe({
            next: () => {
                this.emailSent.set(true);
                this.toast.success('Email envoyé ! Vérifiez votre boîte de réception.');
                this.loading.set(false);
            },
            error: (err) => {
                this.toast.error(err.error?.message || 'Erreur lors de l\'envoi');
                this.loading.set(false);
            }
        });
    }
}
