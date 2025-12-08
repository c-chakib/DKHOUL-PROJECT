import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-help-center',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './help-center.component.html',
    styleUrls: ['./help-center.component.scss']
})
export class HelpCenterComponent { }
