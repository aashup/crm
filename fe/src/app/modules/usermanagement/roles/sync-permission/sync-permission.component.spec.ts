import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SyncPermissionComponent } from './sync-permission.component';

describe('SyncPermissionComponent', () => {
  let component: SyncPermissionComponent;
  let fixture: ComponentFixture<SyncPermissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SyncPermissionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SyncPermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
