import { Test, TestingModule } from '@nestjs/testing';
import { RobotsController } from './robots.controller';

describe('Robots Controller', () => {
  let controller: RobotsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RobotsController],
    }).compile();

    controller = module.get<RobotsController>(RobotsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
