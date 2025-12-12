import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-help-center',
    standalone: true,
    imports: [CommonModule, RouterModule, TranslateModule],
    templateUrl: './help-center.component.html',
    styleUrls: ['./help-center.component.scss']
})
export class HelpCenterComponent { }
