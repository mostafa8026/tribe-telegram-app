import { Test } from '@nestjs/testing';
import { TribeService } from './tribe.service';

describe('TribeService', () => {
  let service: TribeService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [TribeService],
    }).compile();

    service = module.get(TribeService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });
});
