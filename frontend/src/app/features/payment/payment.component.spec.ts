import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentComponent } from './payment.component';
import { StripeService, StripeElementsService } from 'ngx-stripe';
import { BookingService } from '../../core/services/booking.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideRouter } from '@angular/router';

describe('PaymentComponent', () => {
    let component: PaymentComponent;
    let fixture: ComponentFixture<PaymentComponent>;

    beforeEach(async () => {
        const mockStripeService = {
            confirmPayment: jasmine.createSpy('confirmPayment').and.returnValue(of({ paymentIntent: { status: 'succeeded' } }))
        };

        const mockStripeElementsService = {};

        const mockBookingService = {
            createPaymentIntent: jasmine.createSpy('createPaymentIntent').and.returnValue(of({ clientSecret: 'test-secret' }))
        };

        const mockActivatedRoute = {
            queryParams: of({
                serviceId: 'test-id',
                price: 100,
                title: 'Test Service'
            })
        };

        await TestBed.configureTestingModule({
            imports: [PaymentComponent],
            providers: [
                provideRouter([]),
                { provide: StripeService, useValue: mockStripeService },
                { provide: StripeElementsService, useValue: mockStripeElementsService },
                { provide: BookingService, useValue: mockBookingService },
                { provide: ActivatedRoute, useValue: mockActivatedRoute }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();

        fixture = TestBed.createComponent(PaymentComponent);
        component = fixture.componentInstance;
        // Don't call detectChanges to avoid Stripe initialization
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
