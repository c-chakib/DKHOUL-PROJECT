import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from '../map/map.component'; // Reuse existing map

@Component({
    selector: 'app-map-section',
    standalone: true,
    imports: [CommonModule, MapComponent],
    templateUrl: './map-section.component.html',
    styleUrls: ['./map-section.component.scss']
})
export class MapSectionComponent {
    @Input() locations: { lat: number, lng: number, label: string }[] = [];
}
