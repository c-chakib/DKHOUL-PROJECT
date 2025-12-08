import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateServiceComponent } from './create-service.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('CreateServiceComponent', () => {
    let component: CreateServiceComponent;
    let fixture: ComponentFixture<CreateServiceComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CreateServiceComponent, HttpClientTestingModule],
            providers: [
                provideRouter([]),
                provideToastr(),
                provideNoopAnimations()
            ],
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();

        fixture = TestBed.createComponent(CreateServiceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
