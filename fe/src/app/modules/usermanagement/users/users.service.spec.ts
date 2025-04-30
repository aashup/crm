import { TestBed } from '@angular/core/testing';
import { UserService } from 'src/app/_fake/services/user-service';



describe('CityService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
