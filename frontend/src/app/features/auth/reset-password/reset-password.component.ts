import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private userService = inject(UserService);
    private toast = inject(ToastService);

    token = '';

    form = this.fb.group({
        password: ['', [Validators.required, Validators.minLength(8)]],
        passwordConfirm: ['', [Validators.required, Validators.minLength(8)]]
    });

    loading = signal(false);
    resetSuccess = signal(false);
    errorMsg = signal('');

    ngOnInit() {
        this.token = this.route.snapshot.paramMap.get('token') || '';
        if (!this.token) {
            this.toast.error('Lien de réinitialisation invalide');
            this.router.navigate(['/forgot-password']);
        }
    }

    onSubmit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        if (this.form.value.password !== this.form.value.passwordConfirm) {
            this.errorMsg.set('Les mots de passe ne correspondent pas');
            return;
        }

        this.loading.set(true);
        this.errorMsg.set('');

        this.userService.resetPassword(
            this.token,
            this.form.value.password || '',
            this.form.value.passwordConfirm || ''
        ).subscribe({
            next: (res) => {
                this.resetSuccess.set(true);
                this.toast.success('Mot de passe réinitialisé avec succès !');
                if (res.token) {
                    localStorage.setItem('token', res.token);
                }
                this.loading.set(false);
            },
            error: (err) => {
                this.errorMsg.set(err.error?.message || 'Token invalide ou expiré');
                this.toast.error('Échec de la réinitialisation');
                this.loading.set(false);
            }
        });
    }
}
