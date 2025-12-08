import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';
import { ToastrService } from 'ngx-toastr';

describe('ToastService', () => {
    let service: ToastService;
    let mockToastr: any;

    beforeEach(() => {
        mockToastr = {
            success: jasmine.createSpy('success'),
            error: jasmine.createSpy('error'),
            info: jasmine.createSpy('info'),
            warning: jasmine.createSpy('warning')
        };

        TestBed.configureTestingModule({
            providers: [
                ToastService,
                { provide: ToastrService, useValue: mockToastr }
            ]
        });
        service = TestBed.inject(ToastService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
