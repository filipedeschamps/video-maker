import { Module } from '@nestjs/common';
import { TextService } from './text/text.service';
import { ImageService } from './image/image.service';
import { VideoService } from './video/video.service';
import { YoutubeService } from './youtube/youtube.service';
import { RobotsController } from './robots.controller';
import { RobotsService } from './robots.service';

@Module({
  providers: [TextService, ImageService, VideoService, YoutubeService, RobotsService],
  controllers: [RobotsController],
})
export class RobotsModule {}
