import { Component, HostListener, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    // Signals

    currentUser = this.authService.currentUser;

    userPhotoUrl = computed(() => {
        const user = this.currentUser();
        if (!user?.photo) return 'assets/default-avatar.png';
        if (user.photo.startsWith('data:') || user.photo.startsWith('http')) return user.photo;
        return environment.apiUrl.replace('/api/v1', '') + user.photo;
    });

    userFirstName = computed(() => {
        const user = this.currentUser();
        return user?.name ? user.name.split(' ')[0] : '';
    });
    isScrolled = signal(false);
    isMobileMenuOpen = signal(false);
    isProfileMenuOpen = signal(false);

    @HostListener('window:scroll')
    onWindowScroll() {
        this.isScrolled.set(window.scrollY > 20);
    }

    toggleMobileMenu() {
        this.isMobileMenuOpen.update(v => !v);
    }

    closeMobileMenu() {
        this.isMobileMenuOpen.set(false);
    }

    toggleProfileMenu() {
        this.isProfileMenuOpen.update(v => !v);
    }

    onLogout() {
        this.authService.logout();
        this.isProfileMenuOpen.set(false);
        this.isMobileMenuOpen.set(false);
        this.router.navigate(['/']);
    }
}
