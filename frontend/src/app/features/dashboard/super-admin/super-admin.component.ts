import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { SocketService } from '../../../core/services/socket.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';
import { Subscription } from 'rxjs';

import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
    selector: 'app-super-admin',
    standalone: true,
    imports: [CommonModule, FormsModule, ConfirmModalComponent],
    templateUrl: './super-admin.component.html',
    styleUrls: ['./super-admin.component.scss']
})
export class SuperAdminComponent implements OnInit, OnDestroy {
    adminService = inject(AdminService);
    socketService = inject(SocketService);
    toastr = inject(ToastrService);

    // Signals
    stats = signal<any>(null);
    users = signal<any[]>([]);
    searchTerm = signal('');
    loading = signal(false);

    // Subscriptions
    private socketSub = new Subscription();

    // Computed: Filtered Users
    filteredUsers = computed(() => {
        const term = this.searchTerm().toLowerCase();
        return this.users().filter(user =>
            (user.name?.toLowerCase() || '').includes(term) ||
            (user.email?.toLowerCase() || '').includes(term) ||
            (user.role?.toLowerCase() || '').includes(term)
        );
    });

    ngOnInit() {
        this.loadDashboard();
        this.setupRealTimeUpdates();
    }

    ngOnDestroy() {
        this.socketSub.unsubscribe();
    }

    setupRealTimeUpdates() {
        // Listen for new users
        this.socketSub.add(
            this.socketService.listen<any>('user-created').subscribe((newUser) => {
                this.toastr.info(`Nouvel utilisateur : ${newUser.name}`, 'Real-time Update');
                this.users.update(current => [newUser, ...current]);

                // Update stats locally (optimistic)
                if (this.stats()) {
                    this.stats.update(s => ({ ...s, usersCount: s.usersCount + 1 }));
                }
            })
        );

        // Listen for user updates (e.g. role change by another admin)
        this.socketSub.add(
            this.socketService.listen<any>('user-updated').subscribe((updatedUser) => {
                this.users.update(current =>
                    current.map(u => u._id === updatedUser._id ? updatedUser : u)
                );
            })
        );
    }

    loadDashboard() {
        this.loading.set(true);
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

    // --- ACTIONS ---

    // Toggle Verification Status
    toggleUserVerification(user: any) {
        const newStatus = !user.isVerified;
        this.adminService.updateUser(user._id, { isVerified: newStatus }).subscribe({
            next: (res) => {
                const action = newStatus ? 'vérifié' : 'mis en attente';
                this.toastr.success(`Utilisateur ${action} avec succès`);
                // Update local list (although socket might do it too, this is faster feedback)
                this.users.update(current =>
                    current.map(u => u._id === user._id ? { ...u, isVerified: newStatus } : u)
                );
            },
            error: (err) => this.toastr.error('Erreur lors de la mise à jour')
        });
    }



    onConfirmRoleChange() {
        const user = this.userToChangeRole();
        const newRole = this.pendingRole();

        if (!user || !newRole) return;

        this.adminService.updateUser(user._id, { role: newRole }).subscribe({
            next: (res) => {
                this.toastr.success(`Rôle modifié en ${newRole} avec succès`);
                this.users.update(current =>
                    current.map(u => u._id === user._id ? { ...u, role: newRole } : u)
                );
                this.closeRoleModal();
            },
            error: (err) => {
                this.toastr.error('Erreur lors du changement de rôle');
                this.closeRoleModal();
            }
        });
    }

    closeRoleModal() {
        this.showRoleModal.set(false);
        this.userToChangeRole.set(null);
        this.pendingRole.set(null);
    }

    onCancelRoleChange() {
        this.closeRoleModal();
    }


    // Modal State
    showDeleteModal = signal(false);
    userToDeleteId = signal<string | null>(null);

    // Role Change Modal
    showRoleModal = signal(false);
    userToChangeRole = signal<any>(null);
    pendingRole = signal<string | null>(null);
    // userToChangeRoleSelectElement = signal<any>(null); // REMOVED: No longer using native select

    // Custom Dropdown State
    openDropdownId = signal<string | null>(null);

    toggleDropdown(userId: string, event: Event) {
        event.stopPropagation();
        if (this.openDropdownId() === userId) {
            this.openDropdownId.set(null);
        } else {
            this.openDropdownId.set(userId);
        }
    }

    // Close dropdown when clicking elsewhere (handled by backdrop in template or global listener ideally)
    // For now, simple toggle is enough, or we add a click invalidator

    // Select Role (Replaces changeUserRole)
    selectRole(user: any, newRole: string) {
        this.openDropdownId.set(null); // Close dropdown

        if (newRole === user.role) return;

        // Open custom modal
        this.userToChangeRole.set(user);
        this.pendingRole.set(newRole);
        this.showRoleModal.set(true);
    }

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
                // Remove from list
                this.users.update(current => current.filter(u => u._id !== userId));
                if (this.stats()) {
                    this.stats.update(s => ({ ...s, usersCount: s.usersCount - 1 }));
                }
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
        if (!photo) return '/assets/default-avatar.png'; // Absolute path
        if (photo.startsWith('data:') || photo.startsWith('http')) return photo;

        // Ensure backend URL doesn't have double slash issues
        const baseUrl = environment.apiUrl.replace('/api/v1', '');

        // If photo path doesn't start with /uploads/ and isn't a full url, assume it needs the prefix
        // Checking if it already has 'uploads' to avoid doubling
        const cleanPhotoPath = photo.startsWith('/') ? photo : `/${photo}`;

        if (cleanPhotoPath.startsWith('/uploads')) {
            return `${baseUrl}${cleanPhotoPath}`;
        }

        // It's likely just a filename stored in DB, so prepend /uploads
        // But double check against app.js static serve
        return `${baseUrl}/uploads${cleanPhotoPath}`;
    }
}
