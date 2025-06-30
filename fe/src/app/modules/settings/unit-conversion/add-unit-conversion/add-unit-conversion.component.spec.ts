import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddUnitConversionComponent } from './add-unit-conversion.component';


describe('AddUnitConversionComponent', () => {
  let component: AddUnitConversionComponent;
  let fixture: ComponentFixture<AddUnitConversionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUnitConversionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUnitConversionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
