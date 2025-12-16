import { Component, HostListener, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { PwaService } from '../../../core/services/pwa.service';
import { environment } from '../../../../environments/environment';
import { TranslateModule } from '@ngx-translate/core';
import { ResolveUrlPipe } from '../../pipes/resolve-url.pipe';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule, ResolveUrlPipe],
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
    private readonly authService = inject(AuthService);
    public readonly languageService = inject(LanguageService);
    public readonly pwaService = inject(PwaService);
    private readonly router = inject(Router);

    currentUser = this.authService.currentUser;

    userPhotoUrl = computed(() => {
        const user = this.currentUser();
        if (!user?.photo) return 'assets/default-avatar.png';
        // Now using ResolveUrlPipe in template, but if we need it here for some reason, 
        // we can just return the raw path if the pipe handles it, 
        // OR rely on template pipe. 
        // Actually, the template uses `userPhotoUrl()` which returns a string.
        // If the string is relative, the template needs `| resolveUrl`.
        // Let's check template usage.
        return user.photo;
    });

    userFirstName = computed(() => {
        const user = this.currentUser();
        return user?.name ? user.name.split(' ')[0] : '';
    });

    isMobileMenuOpen = signal(false);
    isProfileMenuOpen = signal(false);
    isLangMenuOpen = signal(false);
    isScrolled = signal(false);

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
