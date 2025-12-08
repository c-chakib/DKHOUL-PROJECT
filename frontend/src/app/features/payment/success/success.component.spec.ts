import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SuccessComponent } from './success.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('SuccessComponent', () => {
    let component: SuccessComponent;
    let fixture: ComponentFixture<SuccessComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SuccessComponent],
            providers: [
                provideRouter([]),
                provideToastr(),
                provideNoopAnimations()
            ],
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();

        fixture = TestBed.createComponent(SuccessComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
