import { Controller, Post } from '@nestjs/common';
import { RobotsService } from './robots.service';
import { IOptions } from 'src/shared/options.interface';

@Controller('robots')
export class RobotsController {
  constructor(private robotsService: RobotsService) { }

  @Post('start')
  start(options: IOptions) {
    return this.robotsService.start(options);
  }
}
