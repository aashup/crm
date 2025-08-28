import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PartyDetailsComponent } from './party-details.component';



describe('PartyDetailsComponent', () => {
  let component: PartyDetailsComponent;
  let fixture: ComponentFixture<PartyDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartyDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartyDetailsComponent);
    fixture.detectChanges();
  });
});
