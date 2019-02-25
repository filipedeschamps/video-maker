import { Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { IOptions } from './shared/options.interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  start(options: IOptions): string {
    return this.appService.start(options);
  }
}
