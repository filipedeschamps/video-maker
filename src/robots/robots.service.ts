import { Injectable } from '@nestjs/common';
import { IRobots } from './robots.interface';
import { ImageService } from './image/image.service';
import { TextService } from './text/text.service';
import { VideoService } from './video/video.service';
import { YoutubeService } from './youtube/youtube.service';
import { IOptions } from '../shared/options.interface';

@Injectable()
export class RobotsService implements IRobots {
  constructor(
    private imageService: ImageService,
    private textService: TextService,
    private videoService: VideoService,
    private youtubeService: YoutubeService,
  ) { }

  start(options: IOptions) {
    this.imageService.start();
    this.textService.start();
    this.videoService.start();
    this.youtubeService.start();
    return { message: `I'm alive!`, options };
  }
}
