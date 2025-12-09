import { Component, OnInit, ViewChild, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StripeService, NgxStripeModule, StripePaymentElementComponent } from 'ngx-stripe';
import { StripeElementsOptions, StripePaymentElementOptions } from '@stripe/stripe-js';
import { BookingService } from '../../core/services/booking.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
    selector: 'app-payment',
    standalone: true,
    imports: [CommonModule, NgxStripeModule],
    templateUrl: './payment.component.html',
    styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {
    @ViewChild(StripePaymentElementComponent) paymentElement!: StripePaymentElementComponent;

    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private bookingService = inject(BookingService);
    private stripeService = inject(StripeService);
    private authService = inject(AuthService);
    private toast = inject(ToastService);

    serviceTitle = signal('');
    price = signal(0);
    serviceId = signal('');
    bookingDate = signal('');
    bookingTime = signal('');
    bookingGuests = signal(1);
    bookingDuration = signal(1);
    bookingId = signal(''); // Store bookingId to confirm after payment

    elementsOptions = signal<StripeElementsOptions>({
        locale: 'en',
        appearance: {
            theme: 'stripe',
        },
    });

    paymentElementOptions: StripePaymentElementOptions = {
        layout: {
            type: 'tabs',
            defaultCollapsed: false,
        }
    };

    isProcessing = signal(false);
    errorMessage = signal('');

    ngOnInit() {
        // Validate user is logged in
        if (!this.authService.currentUser()) {
            this.toast.error('Please login to complete payment');
            this.router.navigate(['/login']);
            return;
        }

        this.route.queryParams.subscribe(params => {
            this.serviceId.set(params['serviceId'] || '');
            this.price.set(Number(params['price']) || 0);
            this.serviceTitle.set(params['title'] || '');
            this.bookingDate.set(params['date'] || '');
            this.bookingTime.set(params['time'] || '');
            this.bookingGuests.set(Number(params['guests']) || 1);
            this.bookingDuration.set(Number(params['duration']) || 1);

            // Validate required params
            if (!this.serviceId() || !this.price()) {
                this.toast.error('Missing payment information. Redirecting...');
                this.router.navigate(['/']);
                return;
            }

            this.initializePayment();
        });
    }

    initializePayment() {
        this.bookingService.createPaymentIntent(
            this.serviceId(),
            this.price(),
            this.bookingDate(),
            this.bookingTime(),
            this.bookingGuests(),
            this.bookingDuration()
        )
            .subscribe({
                next: (res) => {
                    // Store bookingId for later confirmation
                    this.bookingId.set(res.bookingId);

                    this.elementsOptions.update(options => ({
                        ...options,
                        clientSecret: res.clientSecret,
                    } as StripeElementsOptions));
                },
                error: (err) => {
                    this.errorMessage.set('Could not initialize payment. Please try again.');
                    this.toast.error('Payment initialization failed');
                    console.error(err);
                }
            });
    }

    pay() {
        if (this.isProcessing()) return;
        this.isProcessing.set(true);

        // Get current user's name for billing (P1 FIX - remove hardcoded name)
        const currentUser = this.authService.currentUser();
        const billingName = currentUser?.name || 'Customer';

        this.stripeService.confirmPayment({
            elements: this.paymentElement.elements,
            confirmParams: {
                return_url: window.location.origin + '/success',
                payment_method_data: {
                    billing_details: {
                        name: billingName // Dynamic user name instead of hardcoded
                    }
                }
            },
            redirect: 'if_required'
        }).subscribe({
            next: (result) => {
                this.isProcessing.set(false);
                if (result.error) {
                    this.errorMessage.set(result.error.message || 'Payment failed');
                    this.toast.error(result.error.message || 'Payment failed');
                } else if (result.paymentIntent?.status === 'succeeded') {
                    // CRITICAL: Confirm booking in backend to update status from 'pending' to 'paid'
                    this.bookingService.confirmBooking(this.bookingId()).subscribe({
                        next: () => {
                            this.toast.success('Paiement réussi ! Réservation confirmée.');
                            this.router.navigate(['/success']);
                        },
                        error: (err) => {
                            console.error('Confirm booking error:', err);
                            // Payment succeeded but confirmation failed - still show success
                            this.toast.success('Payment successful!');
                            this.router.navigate(['/success']);
                        }
                    });
                }
            },
            error: (err) => {
                this.isProcessing.set(false);
                this.errorMessage.set('System error during payment.');
                this.toast.error('System error during payment');
            }
        });
    }
}
