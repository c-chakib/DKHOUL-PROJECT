import { Component, HostListener, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { environment } from '../../../../environments/environment';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
    private readonly authService = inject(AuthService);
    public readonly languageService = inject(LanguageService);
    private readonly router = inject(Router);

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
    isLangMenuOpen = signal(false);

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
        this.isLangMenuOpen.set(false);
    }

    closeProfileMenu() {
        this.isProfileMenuOpen.set(false);
    }

    toggleLangMenu() {
        this.isLangMenuOpen.update(v => !v);
        this.isProfileMenuOpen.set(false);
    }

    closeLangMenu() {
        this.isLangMenuOpen.set(false);
    }

    onLogout() {
        this.authService.logout();
        this.isProfileMenuOpen.set(false);
        this.isMobileMenuOpen.set(false);
        this.router.navigate(['/']);
    }

    switchLanguage(lang: string) {
        this.languageService.switchLanguage(lang);
        this.isMobileMenuOpen.set(false);
        this.isLangMenuOpen.set(false);
    }
}
