import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductInventryComponent } from './product-inventry.component';


describe('ProductInventryComponent', () => {
  let component: ProductInventryComponent;
  let fixture: ComponentFixture<ProductInventryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductInventryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductInventryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
