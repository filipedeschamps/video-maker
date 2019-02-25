import { Test, TestingModule } from '@nestjs/testing';
import { RobotsService } from './robots.service';

describe('RobotsService', () => {
  let service: RobotsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RobotsService],
    }).compile();

    service = module.get<RobotsService>(RobotsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
