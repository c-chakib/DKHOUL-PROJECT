import { Component, Input, OnChanges, OnInit, SimpleChanges, Inject, PLATFORM_ID, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Service } from '../../../core/services/service.service';
import * as L from 'leaflet';
import { Router } from '@angular/router';

@Component({
    selector: 'app-map',
    standalone: true,
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnChanges, OnDestroy {
    @Input() services: Service[] = [];
    @ViewChild('mapContainer') mapContainer!: ElementRef;

    private map: L.Map | undefined;
    private markers: L.Marker[] = [];

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        private router: Router
    ) { }



    ngAfterViewInit() {
        if (isPlatformBrowser(this.platformId)) {
            // Delay slightly to ensure container has dimensions
            setTimeout(() => {
                this.initMap();
            }, 100);
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['services'] && this.map) {
            this.updateMarkers();
        }
    }

    ngOnDestroy() {
        if (this.map) {
            this.map.remove();
        }
    }

    private initMap(): void {
        console.log('MapComponent: initMap called. Container:', this.mapContainer);
        if (this.map) return;

        this.fixLeafletIcons();

        try {
            this.map = L.map(this.mapContainer.nativeElement).setView([31.7917, -7.0926], 6);
            console.log('MapComponent: Leaflet map initialized');

            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(this.map);

            setTimeout(() => {
                this.map?.invalidateSize();
                console.log('MapComponent: invalidateSize called');
                this.updateMarkers();
            }, 200);
        } catch (error) {
            console.error('MapComponent: Error initializing map', error);
        }
    }

    private updateMarkers(): void {
        if (!this.map) return;
        console.log('MapComponent: Updating markers. Services count:', this.services.length);

        // Clear existing markers
        this.markers.forEach(marker => marker.remove());
        this.markers = [];

        const bounds = L.latLngBounds([]);

        this.services.forEach(service => {
            if (service.location && service.location.coordinates) {
                // GeoJSON is [lng, lat], Leaflet wants [lat, lng]
                const lat = service.location.coordinates[1];
                const lng = service.location.coordinates[0];
                // console.log(`Adding marker at ${lat}, ${lng} for service ${service.title}`);


                // Validate coordinates
                if (lat && lng) {
                    const marker = L.marker([lat, lng])
                        .addTo(this.map!);

                    // Create popup content
                    const popupContent = document.createElement('div');
                    popupContent.className = 'text-center p-2';
                    popupContent.innerHTML = `
                        <div class="font-playfair font-bold text-gray-900 text-lg mb-1">${service.title}</div>
                        <div class="text-[#BC5627] font-bold text-base mb-2">${service.price} MAD</div>
                        <button id="btn-${service._id}" class="bg-[#BC5627] text-white text-xs px-3 py-1 rounded hover:bg-[#a0451f]">
                            Voir
                        </button>
                    `;

                    // Handle click on the button inside popup
                    // Note: This is a hacky way to handle Angular routing from vanilla DOM string
                    popupContent.querySelector(`#btn-${service._id}`)?.addEventListener('click', () => {
                        this.router.navigate(['/service', service._id]);
                    });

                    marker.bindPopup(popupContent);
                    this.markers.push(marker);
                    bounds.extend([lat, lng]);
                }
            }
        });

        // Fit bounds if we have markers
        if (this.markers.length > 0) {
            this.map.fitBounds(bounds, { padding: [50, 50] });
        }
    }

    private fixLeafletIcons(): void {
        // Use CDN for robust icon loading (fixes missing asset issues)
        const iconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
        const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
        const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

        const iconDefault = L.icon({
            iconRetinaUrl,
            iconUrl,
            shadowUrl,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            tooltipAnchor: [16, -28],
            shadowSize: [41, 41]
        });
        L.Marker.prototype.options.icon = iconDefault;
    }
}
