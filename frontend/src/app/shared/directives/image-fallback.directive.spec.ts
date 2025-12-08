import { ImageFallbackDirective } from './image-fallback.directive';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

@Component({
    standalone: true,
    imports: [ImageFallbackDirective],
    template: `<img appImageFallback src="test.jpg" />`
})
class TestHostComponent { }

describe('ImageFallbackDirective', () => {
    let fixture: ComponentFixture<TestHostComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestHostComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();
    });

    it('should create an instance', () => {
        const imgEl = fixture.debugElement.query(By.css('img'));
        const directive = imgEl.injector.get(ImageFallbackDirective);
        expect(directive).toBeTruthy();
    });
});
