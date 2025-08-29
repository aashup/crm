import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PurchaseByPartyComponent } from './purchase-by-party.component';


describe('PurchaseByPartyComponent', () => {
  let component: PurchaseByPartyComponent;
  let fixture: ComponentFixture<PurchaseByPartyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseByPartyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseByPartyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
