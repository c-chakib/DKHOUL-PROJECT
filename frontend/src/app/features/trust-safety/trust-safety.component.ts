import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-trust-safety',
    standalone: true,
    imports: [CommonModule, RouterModule, TranslateModule],
    templateUrl: './trust-safety.component.html',
    styleUrls: ['./trust-safety.component.scss']
})
export class TrustSafetyComponent { }
