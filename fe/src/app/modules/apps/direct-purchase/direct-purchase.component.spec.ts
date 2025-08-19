import { ComponentFixture, TestBed } from '@angular/core/testing';



describe('DirectPurchaseComponent', () => {
  let component: DirectPurchaseComponent;
  let fixture: ComponentFixture<DirectPurchaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectPurchaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DirectPurchaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
