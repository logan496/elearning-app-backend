import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PodcastController } from './podcast.controller';
import { PodcastService } from './podcast.service';
import { Podcast } from '../entities/podcast.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Podcast, User])],
  controllers: [PodcastController],
  providers: [PodcastService],
})
export class PodcastModule {}
