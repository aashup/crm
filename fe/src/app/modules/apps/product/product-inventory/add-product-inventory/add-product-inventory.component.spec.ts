import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddProductInventoryComponent } from './add-product-inventory.component';


describe('AddInventoryComponent', () => {
  let component: AddProductInventoryComponent;
  let fixture: ComponentFixture<AddProductInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddProductInventoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddProductInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
