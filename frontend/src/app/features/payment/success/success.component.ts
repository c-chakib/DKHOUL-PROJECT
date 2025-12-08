import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-success',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './success.component.html',
    styleUrls: ['./success.component.scss']
})
export class SuccessComponent implements OnInit {
    private toast = inject(ToastService);

    ngOnInit() {
        this.toast.success('Votre paiement a été validé !', 'Félicitations');
    }

    goToDashboard() {
        window.location.href = '/dashboard';
    }
}
