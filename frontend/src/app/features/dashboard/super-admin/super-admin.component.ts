import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';

import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
    selector: 'app-super-admin',
    standalone: true,
    imports: [CommonModule, FormsModule, ConfirmModalComponent],
    templateUrl: './super-admin.component.html',
    styleUrls: ['./super-admin.component.scss']
})
export class SuperAdminComponent implements OnInit {
    adminService = inject(AdminService);
    toastr = inject(ToastrService);

    // Signals
    stats = signal<any>(null);
    users = signal<any[]>([]);
    searchTerm = signal('');
    loading = signal(false);

    // Computed: Filtered Users
    filteredUsers = computed(() => {
        const term = this.searchTerm().toLowerCase();
        return this.users().filter(user =>
            user.name.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term) ||
            user.role.toLowerCase().includes(term)
        );
    });

    ngOnInit() {
        this.loadDashboard();
    }

    loadDashboard() {
        this.loading.set(true);
        // ForkJoin or sequential, doing sequential for simplicity
        this.adminService.getDashboardStats().subscribe({
            next: (res) => this.stats.set(res.data),
            error: (err) => console.error('Stats Error', err)
        });

        this.adminService.getAllUsers().subscribe({
            next: (res) => {
                this.users.set(res.data.users);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Users Error', err);
                this.loading.set(false);
            }
        });
    }

    // Actions
    // Modal State
    showDeleteModal = signal(false);
    userToDeleteId = signal<string | null>(null);

    showPasswordModal = signal(false);
    userToResetId = signal<string | null>(null);
    newPassword = signal('');


    // Actions
    openDeleteModal(userId: string) {
        this.userToDeleteId.set(userId);
        this.showDeleteModal.set(true);
    }

    onConfirmDelete() {
        const userId = this.userToDeleteId();
        if (!userId) return;

        this.adminService.deleteUser(userId).subscribe({
            next: () => {
                this.toastr.success('Utilisateur supprimé avec succès');
                this.loadDashboard();
                this.closeDeleteModal();
            },
            error: (err) => {
                this.toastr.error(err.error?.message || 'Erreur lors de la suppression');
                this.closeDeleteModal();
            }
        });
    }

    closeDeleteModal() {
        this.showDeleteModal.set(false);
        this.userToDeleteId.set(null);
    }

    // Password Reset
    openPasswordModal(userId: string) {
        this.userToResetId.set(userId);
        this.newPassword.set('');
        this.showPasswordModal.set(true);
    }

    onConfirmResetPassword() {
        const userId = this.userToResetId();
        const password = this.newPassword();

        if (!userId) return;
        if (password.length < 8) {
            this.toastr.warning('Le mot de passe est trop court !');
            return;
        }

        this.adminService.resetUserPassword(userId, password).subscribe({
            next: () => {
                this.toastr.success('Mot de passe réinitialisé avec succès');
                this.closePasswordModal();
            },
            error: (err) => this.toastr.error(err.error?.message || 'Erreur')
        });
    }

    closePasswordModal() {
        this.showPasswordModal.set(false);
        this.userToResetId.set(null);
        this.newPassword.set('');
    }

    // Helpers
    getRoleBadgeClass(role: string): string {
        switch (role) {
            case 'superadmin': return 'bg-purple-100 text-purple-800';
            case 'admin': return 'bg-blue-100 text-blue-800';
            case 'host': return 'bg-orange-100 text-orange-800';
            default: return 'bg-green-100 text-green-800';
        }
    }

    getUserPhotoUrl(photo: string | undefined): string {
        if (!photo) return 'assets/default-user.png';
        if (photo.startsWith('data:') || photo.startsWith('http')) return photo;
        return environment.apiUrl.replace('/api/v1', '') + photo;
    }
}
