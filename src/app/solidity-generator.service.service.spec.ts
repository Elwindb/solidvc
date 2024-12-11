import { TestBed } from '@angular/core/testing';

import { SolidityGeneratorServiceService } from './solidity-generator.service.service';

describe('SolidityGeneratorServiceService', () => {
  let service: SolidityGeneratorServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SolidityGeneratorServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
