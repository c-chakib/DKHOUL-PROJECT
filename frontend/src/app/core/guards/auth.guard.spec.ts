import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
    const executeGuard: CanActivateFn = (...guardParameters) =>
        TestBed.runInInjectionContext(() => authGuard(...guardParameters));

    let mockAuthService: any;
    let mockRouter: any;

    beforeEach(() => {
        mockAuthService = {
            currentUser: jasmine.createSpy('currentUser').and.returnValue({ role: 'tourist' })
        };
        mockRouter = {
            createUrlTree: jasmine.createSpy('createUrlTree').and.returnValue('login-tree')
        };

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: mockAuthService },
                { provide: Router, useValue: mockRouter }
            ]
        });
    });

    it('should be created', () => {
        expect(executeGuard).toBeTruthy();
    });
});
