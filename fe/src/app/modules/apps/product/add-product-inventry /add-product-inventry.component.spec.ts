import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddProductInventryComponent } from './add-product-inventry.component';


describe('AddProductInventryComponent', () => {
  let component: AddProductInventryComponent;
  let fixture: ComponentFixture<AddProductInventryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddProductInventryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddProductInventryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
