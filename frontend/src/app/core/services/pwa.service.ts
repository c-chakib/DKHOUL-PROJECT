import { Injectable, signal } from '@angular/core';
import { Platform } from '@angular/cdk/platform';

@Injectable({
    providedIn: 'root'
})
export class PwaService {
    private promptEvent: any;
    public installable = signal<boolean>(false);

    constructor(private platform: Platform) {
        this.initPwaPrompt();
    }

    private initPwaPrompt() {
        if (this.platform.isBrowser) {
            window.addEventListener('beforeinstallprompt', (event: any) => {
                event.preventDefault();
                this.promptEvent = event;
                this.installable.set(true);
            });
        }
    }

    public promptInstallation() {
        if (this.promptEvent) {
            this.promptEvent.prompt();
            this.promptEvent.userChoice.then((choiceResult: { outcome: string }) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                } else {
                    console.log('User dismissed the install prompt');
                }
                this.promptEvent = null;
                this.installable.set(false);
            });
        }
    }
}
