// src/app/layouts/base-layout/base-layout.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BaseLayoutComponent } from './base-layout.component';
import { HeaderComponent } from '../../shared/components/header/header.component';

describe('BaseLayoutComponent', () => {
  let component: BaseLayoutComponent;
  let fixture: ComponentFixture<BaseLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseLayoutComponent, HeaderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(BaseLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain header', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const header = compiled.querySelector('app-header');
    expect(header).toBeTruthy();
  });

  it('should contain router outlet', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const routerOutlet = compiled.querySelector('router-outlet');
    expect(routerOutlet).toBeTruthy();
  });
});