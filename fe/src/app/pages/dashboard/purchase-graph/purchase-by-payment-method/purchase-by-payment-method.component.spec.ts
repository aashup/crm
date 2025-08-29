import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PurchaseByPaymentMethodComponent } from './purchase-by-payment-method.component';



describe('PurchaseByPaymentComponent', () => {
  let component: PurchaseByPaymentMethodComponent;
  let fixture: ComponentFixture<PurchaseByPaymentMethodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseByPaymentMethodComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseByPaymentMethodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
