import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ServiceService } from '../../../../core/services/service.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
    selector: 'app-edit-service',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './edit-service.component.html'
})
export class EditServiceComponent implements OnInit {
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private serviceService = inject(ServiceService);
    private toast = inject(ToastService);

    serviceForm: FormGroup;
    serviceId = signal<string>('');
    isLoading = signal<boolean>(true);

    constructor() {
        this.serviceForm = this.fb.group({
            title: ['', Validators.required],
            description: ['', Validators.required],
            price: [0, [Validators.required, Validators.min(0)]],
            category: ['EXPERIENCE', Validators.required],
            city: ['', Validators.required],
            duration: [60, Validators.required],
            maxParticipants: [10, Validators.required]
        });
    }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.serviceId.set(id);
            this.loadService(id);
        }
    }

    loadService(id: string) {
        this.serviceService.getServiceById(id).subscribe({
            next: (res) => {
                if (res.data?.service) {
                    const s = res.data.service;
                    this.serviceForm.patchValue({
                        title: s.title,
                        description: s.description,
                        price: s.price,
                        category: s.category,
                        city: s.city,
                        duration: s.duration,
                        maxParticipants: s.maxParticipants
                    });
                }
                this.isLoading.set(false);
            },
            error: (err) => {
                this.toast.error('Failed to load service');
                this.router.navigate(['/dashboard']);
            }
        });
    }

    onSubmit() {
        if (this.serviceForm.invalid) {
            this.serviceForm.markAllAsTouched();
            return;
        }

        this.isLoading.set(true);
        this.serviceService.updateService(this.serviceId(), this.serviceForm.value).subscribe({
            next: () => {
                this.toast.success('Service updated successfully');
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                this.toast.error('Update failed');
                this.isLoading.set(false);
            }
        });
    }
}
