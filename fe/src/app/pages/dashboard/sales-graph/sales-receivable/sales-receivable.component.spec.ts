import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesReceivableComponent } from './sales-receivable.component';

describe('SalesReceivableComponent', () => {
  let component: SalesReceivableComponent;
  let fixture: ComponentFixture<SalesReceivableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesReceivableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesReceivableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
