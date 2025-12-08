import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { AdminService } from '../../../core/services/admin.service';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AdminDashboardComponent', () => {
    let component: DashboardComponent;
    let fixture: ComponentFixture<DashboardComponent>;
    let mockAdminService: any;

    beforeEach(async () => {
        mockAdminService = {
            getStats: jasmine.createSpy('getStats').and.returnValue(of({
                data: {
                    totalUsers: 10,
                    totalServices: 5,
                    totalBookings: 3,
                    categoryStats: [
                        { _id: 'space', count: 3 },
                        { _id: 'skills', count: 2 }
                    ]
                }
            }))
        };

        await TestBed.configureTestingModule({
            imports: [DashboardComponent],
            providers: [
                { provide: AdminService, useValue: mockAdminService }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();

        fixture = TestBed.createComponent(DashboardComponent);
        component = fixture.componentInstance;
        // Don't call detectChanges() to avoid Chart.js initialization
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
