import { Injectable } from '@nestjs/common';
import { IRobots } from '../robots.interface';

@Injectable()
export class YoutubeService  implements IRobots {
  start() {
    console.log('starting YouTube robot!');
  }
}
