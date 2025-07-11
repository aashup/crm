import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesActualTargetComponent } from './sales-actual-target.component';

describe('SalesActualTargetComponent', () => {
  let component: SalesActualTargetComponent;
  let fixture: ComponentFixture<SalesActualTargetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesActualTargetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesActualTargetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
