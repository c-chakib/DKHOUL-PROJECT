import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-contact',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule],
    templateUrl: './contact.component.html',
    styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
    private fb = inject(FormBuilder);
    private toast = inject(ToastService);

    isSubmitting = signal(false);

    contactForm = this.fb.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        subject: ['', Validators.required],
        message: ['', [Validators.required, Validators.minLength(20)]]
    });

    private http = inject(HttpClient);

    onSubmit() {
        if (this.contactForm.invalid) {
            this.toast.warning('Veuillez remplir tous les champs');
            return;
        }

        this.isSubmitting.set(true);

        this.http.post(`${environment.apiUrl}/contact`, this.contactForm.value)
            .subscribe({
                next: (res: any) => {
                    this.toast.success('Message envoyé !', res.message || 'Nous vous répondrons sous 24h.');
                    this.contactForm.reset();
                    this.isSubmitting.set(false);
                },
                error: (err) => {
                    console.error('Contact Error:', err);
                    this.toast.error('Erreur', 'Impossible d\'envoyer le message. Veuillez réessayer.');
                    this.isSubmitting.set(false);
                }
            });
    }
}
