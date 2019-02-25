import { Module } from '@nestjs/common';
import { RobotsModule } from './robots/robots.module';

@Module({
  imports: [RobotsModule],
})
export class AppModule {}
