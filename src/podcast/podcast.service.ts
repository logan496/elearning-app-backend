import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Podcast } from '../entities/podcast.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class PodcastService {
  constructor(
    @InjectRepository(Podcast)
    private podcastRepository: Repository<Podcast>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createPodcast(
    publisherId: number,
    title: string,
    description: string,
    duration: string,
    audioUrl: string,
    imageUrl?: string,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: publisherId },
    });

    if (!user || !user.isPublisher) {
      throw new ForbiddenException('Vous ne pouvez pas publier de podcasts');
    }

    const podcast = this.podcastRepository.create({
      publisherId,
      title,
      description,
      duration,
      audioUrl,
      imageUrl: imageUrl || '/placeholder.svg',
    });

    await this.podcastRepository.save(podcast);
    return this.podcastRepository.findOne({
      where: { id: podcast.id },
      relations: ['publisher'],
    });
  }

  async getAllPodcasts() {
    return this.podcastRepository.find({
      relations: ['publisher'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPodcastById(id: number) {
    const podcast = await this.podcastRepository.findOne({
      where: { id },
      relations: ['publisher'],
    });

    if (!podcast) {
      throw new NotFoundException('Podcast non trouvé');
    }

    podcast.views++;
    await this.podcastRepository.save(podcast);
    return podcast;
  }

  async getPodcastsByPublisher(publisherId: number) {
    return this.podcastRepository.find({
      where: { publisherId },
      relations: ['publisher'],
      order: { createdAt: 'DESC' },
    });
  }

  async deletePodcast(podcastId: number, publisherId: number) {
    const podcast = await this.podcastRepository.findOne({
      where: { id: podcastId },
    });

    if (!podcast) {
      throw new NotFoundException('Podcast non trouvé');
    }

    if (podcast.publisherId !== publisherId) {
      throw new ForbiddenException('Vous ne pouvez pas supprimer ce podcast');
    }

    await this.podcastRepository.delete(podcastId);
    return { message: 'Podcast supprimé avec succès' };
  }
}
