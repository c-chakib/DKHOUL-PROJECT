import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ServiceService } from '../../core/services/service.service';
import { ToastService } from '../../core/services/toast.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-create-service',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './create-service.component.html',
    styleUrls: ['./create-service.component.scss']
})
export class CreateServiceComponent {
    private fb = inject(FormBuilder);
    private serviceService = inject(ServiceService);
    private router = inject(Router);
    private toast = inject(ToastService);

    serviceForm: FormGroup;

    // Uploaded Images State
    uploadedImages = signal<string[]>([]);
    isUploading = signal(false);
    isGenerating = signal(false);

    // Constants
    categories = ['SPACE', 'SKILL', 'CONNECT'];
    cities = ['Casablanca', 'Marrakech', 'Agadir', 'Tanger', 'Fès', 'Rabat', 'Essaouira', 'Merzouga'];
    availableLanguages = ['Darija', 'Français', 'Anglais', 'Espagnol'];

    // 👇 NOUVEAU : Liste des créneaux horaires affichés
    availableTimes = [
        '08:00', '09:00', '10:00', '11:00', '12:00',
        '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
    ];

    constructor() {
        this.serviceForm = this.fb.group({
            title: ['', Validators.required],
            category: ['', Validators.required],
            city: ['Marrakech', Validators.required],
            price: [0, [Validators.required, Validators.min(1)]],
            duration: [60, [Validators.required, Validators.min(15)]],
            maxParticipants: [10, [Validators.required, Validators.min(1)]],
            description: ['', [Validators.required, Validators.minLength(20)]],
            languages: [[]],
            // 👇 NOUVEAU : Champ obligatoire pour les créneaux
            timeSlots: [[], Validators.required]
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

    // 👇 NOUVEAU : Logique pour cocher/décocher les horaires
    toggleTimeSlot(time: string, event: any) {
        const currentSlots = this.serviceForm.get('timeSlots')?.value as string[];
        if (event.target.checked) {
            // On ajoute et on trie pour que ce soit propre (09:00 avant 14:00)
            const newSlots = [...currentSlots, time].sort();
            this.serviceForm.patchValue({ timeSlots: newSlots });
        } else {
            this.serviceForm.patchValue({ timeSlots: currentSlots.filter(t => t !== time) });
        }
    }

    // Image Upload Logic (Inchangé)
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
                    this.toast.success('Image téléchargée');
                },
                error: (err) => {
                    console.error('Upload Failed', err);
                    this.toast.error('Échec du téléchargement');
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
            this.toast.warning('Veuillez entrer un titre et une catégorie.');
            return;
        }

        this.isGenerating.set(true);
        this.serviceService.generateDescription(title, category).subscribe({
            next: (res) => {
                this.serviceForm.patchValue({ description: res.data.description });
                this.isGenerating.set(false);
            },
            error: (err) => {
                console.error('AI Generation Error', err);
                this.toast.error('Erreur AI');
                this.isGenerating.set(false);
            }
        });
    }

    submitService() {
        // Vérification incluant timeSlots grâce au Validators.required
        if (this.serviceForm.invalid || this.uploadedImages().length === 0) {
            this.serviceForm.markAllAsTouched();
            this.toast.warning('Veuillez remplir tous les champs (y compris les horaires) et ajouter une image.');
            return;
        }

        const formValue = this.serviceForm.value;

        const newService = {
            ...formValue,
            images: this.uploadedImages(),
            // Ajout d'une localisation par défaut basée sur la ville (Feature Simplifiée)
            location: {
                type: 'Point',
                address: `${formValue.city}, Maroc`,
                coordinates: [-7.9811, 31.6295] // Coordonnées par défaut (Marrakech), idéalement à dynamiser plus tard
            }
        };

        this.serviceService.createService(newService).subscribe({
            next: (res) => {
                this.toast.success('Annonce publiée avec succès !', 'Félicitations');
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                console.error('Error creating service:', err);
                this.toast.error('Erreur lors de la création');
            }
        });
    }
}