import { TestBed } from '@angular/core/testing';

import { TemaService } from './tema';

describe('TemaService', () => {
  let service: TemaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TemaService],
    });

    service = TestBed.inject(TemaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
