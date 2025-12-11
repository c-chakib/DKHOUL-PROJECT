import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceService, Service } from '../../core/services/service.service';
import { ToastService } from '../../core/services/toast.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-edit-service',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './edit-service.component.html',
    styleUrls: ['./edit-service.component.scss']
})
export class EditServiceComponent implements OnInit {
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private serviceService = inject(ServiceService);
    private toast = inject(ToastService);

    serviceId = signal<string>('');
    serviceForm: FormGroup;
    isLoading = signal(true);
    isSaving = signal(false);

    // Uploaded Images State
    uploadedImages = signal<string[]>([]);
    isUploading = signal(false);
    isGenerating = signal(false);

    // Constants
    categories = ['SPACE', 'SKILL', 'CONNECT'];
    cities = ['Casablanca', 'Marrakech', 'Agadir', 'Tanger', 'Fès', 'Rabat', 'Essaouira', 'Merzouga'];
    availableLanguages = ['Darija', 'Français', 'Anglais', 'Espagnol'];

    constructor() {
        this.serviceForm = this.fb.group({
            title: ['', Validators.required],
            category: ['', Validators.required],
            city: ['Marrakech', Validators.required],
            price: [0, [Validators.required, Validators.min(1)]],
            duration: [60, [Validators.required, Validators.min(15)]],
            maxParticipants: [10, [Validators.required, Validators.min(1)]],
            description: ['', [Validators.required, Validators.minLength(20)]],
            languages: [[]]
        });
    }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            this.toast.error('Service ID not found');
            this.router.navigate(['/dashboard']);
            return;
        }

        this.serviceId.set(id);
        this.loadService(id);
    }

    loadService(id: string) {
        this.serviceService.getServiceById(id).subscribe({
            next: (res) => {
                if (res.data && res.data.service) {
                    const s = res.data.service;

                    // Pre-fill form with existing data
                    this.serviceForm.patchValue({
                        title: s.title,
                        category: s.category,
                        city: s.city,
                        price: s.price,
                        duration: s.duration,
                        maxParticipants: s.maxParticipants,
                        description: s.description,
                        languages: s.languages || []
                    });

                    // Pre-fill images
                    if (s.images && s.images.length > 0) {
                        this.uploadedImages.set(s.images);
                    }
                }
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Error loading service:', err);
                this.toast.error('Failed to load service');
                this.isLoading.set(false);
                this.router.navigate(['/dashboard']);
            }
        });
    }

    // Language Toggle Logic
    toggleLanguage(lang: string, event: any) {
        const currentLangs = this.serviceForm.get('languages')?.value as string[];
        if (event.target.checked) {
            this.serviceForm.patchValue({ languages: [...currentLangs, lang] });
        } else {
            this.serviceForm.patchValue({ languages: currentLangs.filter(l => l !== lang) });
        }
    }

    isLanguageSelected(lang: string): boolean {
        const langs = this.serviceForm.get('languages')?.value as string[];
        return langs?.includes(lang) || false;
    }

    // Image Upload Logic
    onFileSelected(event: any) {
        const file: File = event.target.files[0];
        if (file) {
            if (this.uploadedImages().length >= 4) {
                this.toast.warning('Maximum 4 images allowed.');
                return;
            }

            this.isUploading.set(true);
            this.serviceService.uploadImage(file).subscribe({
                next: (res) => {
                    const imageUrl = res.url.startsWith('data:') ? res.url : environment.apiUrl.replace('/api/v1', '') + res.url;
                    this.uploadedImages.update(imgs => [...imgs, imageUrl]);
                    this.isUploading.set(false);
                    this.toast.success('Image uploaded');
                },
                error: (err) => {
                    console.error('Upload Failed', err);
                    this.toast.error('Upload failed');
                    this.isUploading.set(false);
                }
            });
        }
    }

    removeImage(index: number) {
        this.uploadedImages.update(imgs => imgs.filter((_, i) => i !== index));
    }

    generateWithAI() {
        const { title, category } = this.serviceForm.value;
        if (!title || !category) {
            this.toast.warning('Please enter a title and category first');
            return;
        }

        this.isGenerating.set(true);
        this.serviceService.generateDescription(title, category).subscribe({
            next: (res) => {
                this.serviceForm.patchValue({ description: res.data.description });
                this.isGenerating.set(false);
                this.toast.success('Description generated!');
            },
            error: (err) => {
                console.error('AI Generation Error', err);
                this.toast.error('AI generation failed');
                this.isGenerating.set(false);
            }
        });
    }

    submitService() {
        if (this.serviceForm.invalid || this.uploadedImages().length === 0) {
            this.serviceForm.markAllAsTouched();
            this.toast.warning('Please fill all required fields and add at least one image');
            return;
        }

        this.isSaving.set(true);
        const formValue = this.serviceForm.value;

        const updatedService = {
            ...formValue,
            images: this.uploadedImages(),
            location: {
                type: 'Point',
                address: `${formValue.city}, Maroc`,
                coordinates: [-7.9811, 31.6295]
            }
        };

        this.serviceService.updateService(this.serviceId(), updatedService).subscribe({
            next: (res) => {
                this.toast.success('Service updated successfully!');
                this.isSaving.set(false);
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                console.error('Error updating service:', err);
                this.toast.error('Failed to update service');
                this.isSaving.set(false);
            }
        });
    }

    cancel() {
        this.router.navigate(['/dashboard']);
    }
}
