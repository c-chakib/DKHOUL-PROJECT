import { TestBed } from '@angular/core/testing';
import { ServiceService } from './service.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';

describe('ServiceService', () => {
    let service: ServiceService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ServiceService]
        });
        service = TestBed.inject(ServiceService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get all services', () => {
        const dummyServices = { results: 0, total: 0, page: 1, data: { services: [] } };

        service.getAllServices().subscribe(res => {
            expect(res).toEqual(dummyServices);
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/services`);
        expect(req.request.method).toBe('GET');
        req.flush(dummyServices);
    });
});
