import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MarketplaceComponent } from './marketplace.component';
import { ServiceService } from '../../core/services/service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideRouter } from '@angular/router';

describe('MarketplaceComponent', () => {
    let component: MarketplaceComponent;
    let fixture: ComponentFixture<MarketplaceComponent>;
    let mockServiceService: any;
    let mockActivatedRoute: any;

    beforeEach(async () => {
        mockServiceService = {
            getAllServices: jasmine.createSpy('getAllServices').and.returnValue(of({ results: 0, data: { services: [] } }))
        };
        mockActivatedRoute = {
            queryParams: of({})
        };

        await TestBed.configureTestingModule({
            imports: [MarketplaceComponent],
            providers: [
                provideRouter([]),
                { provide: ServiceService, useValue: mockServiceService },
                { provide: ActivatedRoute, useValue: mockActivatedRoute }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();

        fixture = TestBed.createComponent(MarketplaceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
