import { TestBed } from '@angular/core/testing';
import { ChatService } from './chat.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { signal } from '@angular/core';

describe('ChatService', () => {
    let service: ChatService;
    let mockAuthService: any;

    beforeEach(() => {
        mockAuthService = {
            currentUser: signal(null)
        };

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                ChatService,
                { provide: AuthService, useValue: mockAuthService }
            ]
        });
        service = TestBed.inject(ChatService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
