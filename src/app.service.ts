import { Injectable } from '@nestjs/common';
import { IOptions } from './shared/options.interface';

@Injectable()
export class AppService {
  start(options: IOptions) {
    console.log('starting...');
    return options;
  }
}
