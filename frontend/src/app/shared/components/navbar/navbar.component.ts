import { Component, HostListener, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

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
