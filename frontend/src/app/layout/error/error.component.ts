import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

interface ErrorConfig {
    code: string;
    title: string;
    message: string;
    icon: string;
    buttonText: string;
    buttonAction: 'home' | 'refresh' | 'login' | 'back';
}

@Component({
    selector: 'app-error',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './error.component.html',
    styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    errorConfig: ErrorConfig = {
        code: '404',
        title: 'Mirage ?',
        message: 'Cette page semble avoir disparu dans les sables du Sahara.',
        icon: '🐪',
        buttonText: "Retour à l'Oasis",
        buttonAction: 'home'
    };

    private errorMap: Record<string, ErrorConfig> = {
        '404': {
            code: '404',
            title: 'Mirage ?',
            message: 'Cette page semble avoir disparu dans les sables du Sahara. Peut-être un mirage au milieu du désert marocain...',
            icon: '🐪',
            buttonText: "Retour à l'Oasis",
            buttonAction: 'home'
        },
        '500': {
            code: '500',
            title: 'Erreur Technique',
            message: 'Nos artisans travaillent à réparer le problème. Le zellige est en cours de réparation...',
            icon: '🔧',
            buttonText: 'Actualiser la page',
            buttonAction: 'refresh'
        },
        '403': {
            code: '403',
            title: 'Accès Interdit',
            message: "Vous n'avez pas la clé de cette porte. Cette ruelle de la Médina ne vous est pas encore accessible.",
            icon: '🚪',
            buttonText: 'Se connecter',
            buttonAction: 'login'
        },
        '401': {
            code: '401',
            title: 'Non Authentifié',
            message: 'Veuillez vous identifier pour accéder à cette partie du Riad.',
            icon: '🔐',
            buttonText: 'Se connecter',
            buttonAction: 'login'
        }
    };

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            const type = params['type'] || '404';
            this.errorConfig = this.errorMap[type] || this.errorMap['404'];
        });
    }

    handleAction() {
        switch (this.errorConfig.buttonAction) {
            case 'home':
                this.router.navigate(['/']);
                break;
            case 'refresh':
                window.location.reload();
                break;
            case 'login':
                this.router.navigate(['/login']);
                break;
            case 'back':
                window.history.back();
                break;
        }
    }
}
