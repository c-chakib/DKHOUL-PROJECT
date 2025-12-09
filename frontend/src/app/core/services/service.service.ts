import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Service {
    _id: string;
    title: string;
    description: string;
    price: number;
    category: 'SPACE' | 'SKILL' | 'CONNECT';
    location?: {
        type: 'Point';
        coordinates: [number, number]; // [lng, lat]
        address: string;
    };
    host: {
        _id: string;
        name: string;
        photo?: string;
        bio?: string;
    };
    images: string[];
    city: 'Casablanca' | 'Marrakech' | 'Agadir' | 'Tanger' | 'Fès' | 'Rabat' | 'Essaouira' | 'Merzouga';
    duration: number; // minutes
    maxParticipants: number;
    languages: string[];
    included: string[];
    requirements: string[];
    timeSlots?: string[];
    rating?: number;
    reviews?: number;
}

import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ServiceService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl + '/services';

    getAllServices(params?: any): Observable<{ results: number; total: number; page: number; data: { services: Service[] } }> {
        let httpParams = new HttpParams();
        if (params) {
            Object.keys(params).forEach(key => {
                if (params[key]) {
                    httpParams = httpParams.set(key, params[key]);
                }
            });
        }
        return this.http.get<{ results: number; total: number; page: number; data: { services: Service[] } }>(this.apiUrl, { params: httpParams });
    }

    // /services-within/:distance/center/:latlng/unit/:unit
    searchServices(distance: number, lat: number, lng: number, unit: 'km' | 'mi' = 'km'): Observable<{ results: number; data: { services: Service[] } }> {
        return this.http.get<{ results: number; data: { services: Service[] } }>(
            `${this.apiUrl}/services-within/${distance}/center/${lat},${lng}/unit/${unit}`
        );
    }

    getServiceById(id: string): Observable<{ status: string; data: { service: Service } }> {
        return this.http.get<{ status: string; data: { service: Service } }>(`${this.apiUrl}/${id}`);
    }

    generateDescription(title: string, category: string): Observable<{ status: string; data: { description: string } }> {
        return this.http.post<{ status: string; data: { description: string } }>(
            `${environment.apiUrl}/ai/generate-description`,
            { title, category }
        );
    }

    createService(serviceData: any): Observable<{ status: string; data: { service: Service } }> {
        return this.http.post<{ status: string; data: { service: Service } }>(this.apiUrl, serviceData);
    }

    // Update an existing service
    updateService(id: string, serviceData: any): Observable<{ status: string; data: { service: Service } }> {
        return this.http.patch<{ status: string; data: { service: Service } }>(`${this.apiUrl}/${id}`, serviceData);
    }

    uploadImage(file: File): Observable<{ status: string; url: string }> {
        const formData = new FormData();
        formData.append('image', file);
        return this.http.post<{ status: string; url: string }>(`${environment.apiUrl}/upload`, formData);
    }

    // Get services created by the current user (Host)
    getMyServices(): Observable<{ results: number; data: { services: Service[] } }> {
        return this.http.get<{ results: number; data: { services: Service[] } }>(`${this.apiUrl}/my-services`);
    }

    // Delete a service
    deleteService(id: string): Observable<{ status: string }> {
        return this.http.delete<{ status: string }>(`${this.apiUrl}/${id}`);
    }
}
