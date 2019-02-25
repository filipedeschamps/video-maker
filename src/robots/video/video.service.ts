import { Injectable } from '@nestjs/common';
import { IRobots } from '../robots.interface';

@Injectable()
export class VideoService implements IRobots {
  start() {
    console.log('starting video robot!');
  }
}
