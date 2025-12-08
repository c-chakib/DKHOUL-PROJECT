import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AiGuideComponent } from './ai-guide.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AiGuideComponent', () => {
    let component: AiGuideComponent;
    let fixture: ComponentFixture<AiGuideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AiGuideComponent, HttpClientTestingModule],
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();

        fixture = TestBed.createComponent(AiGuideComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
