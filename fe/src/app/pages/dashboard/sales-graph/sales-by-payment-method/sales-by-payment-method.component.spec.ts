import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SalesByPaymentMethodComponent } from './sales-by-payment-method.component';


describe('SalesByPaymentComponent', () => {
  let component: SalesByPaymentMethodComponent;
  let fixture: ComponentFixture<SalesByPaymentMethodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesByPaymentMethodComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesByPaymentMethodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
