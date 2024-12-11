import { TestBed } from '@angular/core/testing';

import { ShaclInterpreterService } from './shacl-interpreter.service';

describe('ShaclInterpreterService', () => {
  let service: ShaclInterpreterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShaclInterpreterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
