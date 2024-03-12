import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ShorterComponent } from './shorter.component';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {BrowserTestingModule} from "@angular/platform-browser/testing";

describe('ShorterComponent', () => {
  let component: ShorterComponent;
  let fixture: ComponentFixture<ShorterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShorterComponent,RouterTestingModule,HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShorterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
