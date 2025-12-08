import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GlassCardComponent } from './glass-card.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('GlassCardComponent', () => {
    let component: GlassCardComponent;
    let fixture: ComponentFixture<GlassCardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [GlassCardComponent],
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();

        fixture = TestBed.createComponent(GlassCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
