import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    private translate = inject(TranslateService);
    private document = inject(DOCUMENT);

    // Expose current language as a signal for UI reactivity
    currentLang = signal<string>('fr');

    initLanguage() {
        const savedLang = localStorage.getItem('language');
        const browserLang = this.translate.getBrowserLang();
        const defaultLang = savedLang || (browserLang?.match(/fr|en|ar/) ? browserLang : 'fr');

        this.translate.addLangs(['fr', 'en', 'ar']);
        this.translate.setDefaultLang('fr');
        this.switchLanguage(defaultLang);
    }

    switchLanguage(lang: string) {
        this.translate.use(lang);
        this.currentLang.set(lang);
        localStorage.setItem('language', lang);
        this.updateDirection(lang);
    }

    private updateDirection(lang: string) {
        const htmlTag = this.document.documentElement;
        if (lang === 'ar') {
            htmlTag.setAttribute('dir', 'rtl');
            htmlTag.setAttribute('lang', 'ar');
        } else {
            htmlTag.setAttribute('dir', 'ltr');
            htmlTag.setAttribute('lang', lang);
        }
    }
}
