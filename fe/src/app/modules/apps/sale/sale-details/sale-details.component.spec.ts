import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SaleDetailsComponent } from './sale-details.component';
import { SaleComponent } from '../sale/sale.component';


describe('SaleDetailsComponent', () => {
  let component: SaleDetailsComponent;
  let fixture: ComponentFixture<SaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaleComponent);
    fixture.detectChanges();
  });
});
