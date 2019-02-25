import { Injectable } from '@nestjs/common';
import { IRobots } from '../robots.interface';

@Injectable()
export class ImageService implements IRobots {
  start() {
    console.log('starting image robot!');
  }
}
