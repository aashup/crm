import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SalesByPartyComponent } from './sales-by-party.component';


describe('SalesByPartyComponent', () => {
  let component: SalesByPartyComponent;
  let fixture: ComponentFixture<SalesByPartyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesByPartyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesByPartyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
