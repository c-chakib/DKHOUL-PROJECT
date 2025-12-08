import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FancyButtonComponent } from './fancy-button.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('FancyButtonComponent', () => {
    let component: FancyButtonComponent;
    let fixture: ComponentFixture<FancyButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FancyButtonComponent],
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();

        fixture = TestBed.createComponent(FancyButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
