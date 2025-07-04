import { TestBed } from '@angular/core/testing';
import { ProductSellerService } from './product-seller.service';


describe('ProductSellerService', () => {
  let service: ProductSellerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductSellerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
