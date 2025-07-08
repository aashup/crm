import { TestBed } from '@angular/core/testing';

import { DirectSaleService } from './direct-sale.service';

describe('DirectSaleService', () => {
  let service: DirectSaleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DirectSaleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
