import { Component, OnInit, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, User } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { HttpClient } from '@angular/common/http';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-profile-settings',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './profile-settings.component.html',
    styleUrls: ['./profile-settings.component.scss']
})
export class ProfileSettingsComponent implements OnInit {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private toast = inject(ToastService);
    private http = inject(HttpClient);

    private route = inject(ActivatedRoute);

    profileForm!: FormGroup;
    passwordForm!: FormGroup;
    notificationForm!: FormGroup;

    // Payments Data (Mock for now, replace with proper Stripe Service later)
    paymentMethods = signal<any[]>([]);

    selectedFile: File | null = null;
    imagePreview = signal<string | ArrayBuffer | null>(null);
    isLoading = signal<boolean>(false);
    currentUser = this.authService.currentUser;

    // Active tab tracking
    activeTab = signal<string>('profile');

    // Sidebar menu items with tab IDs
    menuItems = [
        { id: 'profile', label: 'Mon Profil', icon: 'fas fa-user' },
        { id: 'security', label: 'Sécurité', icon: 'fas fa-shield-alt' },
        { id: 'payments', label: 'Paiements', icon: 'fas fa-credit-card' },
        { id: 'notifications', label: 'Notifications', icon: 'fas fa-bell' },
    ];

    setActiveTab(tabId: string) {
        this.activeTab.set(tabId);
    }

    ngOnInit() {
        this.initForm();
        this.initPasswordForm();
        this.initNotificationForm();
        this.loadUserData();

        // Check query params for tab selection
        this.route.queryParams.subscribe(params => {
            if (params['tab']) {
                this.setActiveTab(params['tab']);
            }
        });
    }

    initForm() {
        this.profileForm = this.fb.group({
            name: ['', Validators.required],
            email: [{ value: '', disabled: true }], // Email usually immutable
            bio: [''],
            // phone: [''] // Add if backend supports it
        });
    }

    initPasswordForm() {
        this.passwordForm = this.fb.group({
            passwordCurrent: ['', Validators.required],
            password: ['', [Validators.required, Validators.minLength(8)]],
            passwordConfirm: ['', Validators.required]
        }, { validators: this.passwordMatchValidator });
    }

    initNotificationForm() {
        // TODO: Load these from user preferences if available in backend
        this.notificationForm = this.fb.group({
            emailBooking: [true],
            emailMessage: [true],
            emailNewsletter: [false]
        });
    }

    passwordMatchValidator(g: FormGroup) {
        return g.get('password')?.value === g.get('passwordConfirm')?.value
            ? null : { mismatch: true };
    }

    loadUserData() {
        const user = this.currentUser();
        if (user) {
            this.profileForm.patchValue({
                name: user.name,
                email: user.email,
                bio: user.bio || ''
            });
            if (user.photo) {
                this.imagePreview.set(this.getImageUrl(user.photo));
            }
        }
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            this.selectedFile = input.files[0];

            const reader = new FileReader();
            reader.onload = () => {
                this.imagePreview.set(reader.result);
            };
            reader.readAsDataURL(this.selectedFile);
        }
    }

    onSubmit() {
        if (this.profileForm.invalid) return;

        this.isLoading.set(true);
        const formData = new FormData();
        formData.append('name', this.profileForm.get('name')?.value);
        formData.append('bio', this.profileForm.get('bio')?.value); // Ensure backend allows bio

        if (this.selectedFile) {
            formData.append('photo', this.selectedFile);
        }

        // Call API (Assuming request method in AuthService or direct Http)
        // Using direct HTTP for custom endpoint or adding method to AuthService
        this.http.patch<{ status: string, data: { user: User } }>(`${environment.apiUrl}/users/updateMe`, formData)
            .subscribe({
                next: (res) => {
                    this.authService.setUser(res.data.user); // Update signal
                    this.toast.success('Succès', 'Profil mis à jour avec succès');
                    this.isLoading.set(false);
                },
                error: (err) => {
                    console.error('Update Error:', err);
                    this.toast.error('Erreur', 'Impossible de mettre à jour le profil');
                    this.isLoading.set(false);
                }
            });
    }

    onChangePassword() {
        if (this.passwordForm.invalid) return;

        this.isLoading.set(true);
        const { passwordCurrent, password, passwordConfirm } = this.passwordForm.value;

        this.http.patch(`${environment.apiUrl}/users/updateMyPassword`, {
            passwordCurrent,
            password,
            passwordConfirm
        }).subscribe({
            next: () => {
                this.toast.success('Succès', 'Mot de passe modifié avec succès');
                this.passwordForm.reset();
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Password Update Error:', err);
                this.toast.error('Erreur', err.error?.message || 'Impossible de modifier le mot de passe');
                this.isLoading.set(false);
            }
        });
    }

    onUpdateNotifications() {
        // Placeholder for notification settings update
        this.toast.info('Info', 'Préférences sauvegardées (Localement)');
        // In real app: this.http.patch(`${environment.apiUrl}/users/updateMe`, { ...this.notificationForm.value })...
    }

    onAddPaymentMethod() {
        this.toast.info('Paiements', 'Intégration Stripe requise pour ajouter une carte.');
    }

    triggerFileInput() {
        document.getElementById('fileInput')?.click();
    }

    getImageUrl(url: string | undefined): string {
        if (!url) return 'assets/images/placeholder-avatar.jpg';
        if (url.startsWith('data:') || url.startsWith('http')) return url;
        return environment.apiUrl.replace('/api/v1', '') + url;
    }
}
