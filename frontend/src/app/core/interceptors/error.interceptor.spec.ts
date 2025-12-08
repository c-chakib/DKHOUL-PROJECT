import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn } from '@angular/common/http';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
    const executeInterceptor: HttpInterceptorFn = (req, next) =>
        TestBed.runInInjectionContext(() => errorInterceptor(req, next));

    beforeEach(() => {
        TestBed.configureTestingModule({});
    });

    it('should be created', () => {
        expect(executeInterceptor).toBeTruthy();
    });
});
