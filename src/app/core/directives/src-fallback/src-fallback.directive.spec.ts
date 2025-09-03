import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { ImgFallbackDirective } from './src-fallback.directive';
import { By } from '@angular/platform-browser';
import { ImgFallbackModule } from './src-fallback.module';

@Component({
    selector: 'app-test-component',
    template: ` <img srcFallback /> `
})
class TestComponent {}

describe('Ng2ImgFallback Directive', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;
    let imgElement: DebugElement;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [ImgFallbackModule],
            declarations: [TestComponent]
        }).compileComponents();
    }));

    it('should set placeholder', () => {
        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        imgElement = fixture.debugElement.query(By.css('img'));
        // imgElement.
        expect(true).toBeTruthy();
    });
});
