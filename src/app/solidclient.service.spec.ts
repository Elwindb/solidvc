import { TestBed } from '@angular/core/testing';

import { SolidclientService } from './solidclient.service';

describe('SolidclientService', () => {
  let service: SolidclientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SolidclientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
