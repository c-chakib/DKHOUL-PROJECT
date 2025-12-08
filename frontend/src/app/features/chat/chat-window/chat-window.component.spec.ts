import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatWindowComponent } from './chat-window.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ChatWindowComponent', () => {
    let component: ChatWindowComponent;
    let fixture: ComponentFixture<ChatWindowComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ChatWindowComponent, HttpClientTestingModule],
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ChatWindowComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
