import { Injectable } from '@nestjs/common';
import { IRobots } from '../robots.interface';

@Injectable()
export class TextService implements IRobots {
  start() {
    console.log('starting text robot!');
  }
}
