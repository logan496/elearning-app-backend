import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PodcastService } from './podcast.service';
import { CreatePodcastDto } from './dto/create-podcast.dto';
import { PodcastResponseDto } from './dto/podcast-response.dto';
import { Podcast } from '../entities/podcast.entity';

@ApiTags('Podcasts')
@Controller('api/podcasts')
export class PodcastController {
  constructor(private podcastService: PodcastService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Créer un nouveau podcast (publishers uniquement)' })
  @ApiResponse({
    status: 201,
    description: 'Podcast créé',
    type: PodcastResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Vous ne pouvez pas publier de podcasts',
  })
  async createPodcast(
    @Req() req,
    @Body() dto: CreatePodcastDto,
  ): Promise<Podcast | null> {
    return this.podcastService.createPodcast(
      req.user.id,
      dto.title,
      dto.description,
      dto.duration,
      dto.audioUrl,
      dto.imageUrl,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les podcasts' })
  @ApiResponse({
    status: 200,
    description: 'Liste des podcasts',
    type: [PodcastResponseDto],
  })
  async getAllPodcasts(): Promise<PodcastResponseDto[]> {
    return this.podcastService.getAllPodcasts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un podcast par son ID' })
  @ApiParam({ name: 'id', description: 'ID du podcast' })
  @ApiResponse({
    status: 200,
    description: 'Détails du podcast',
    type: PodcastResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Podcast non trouvé' })
  async getPodcastById(@Param('id') id: number): Promise<PodcastResponseDto> {
    return this.podcastService.getPodcastById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('publisher/:publisherId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "Récupérer les podcasts d'un publisher" })
  @ApiParam({ name: 'publisherId', description: 'ID du publisher' })
  @ApiResponse({
    status: 200,
    description: 'Liste des podcasts du publisher',
    type: [PodcastResponseDto],
  })
  async getPodcastsByPublisher(
    @Param('publisherId') publisherId: number,
  ): Promise<PodcastResponseDto[]> {
    return this.podcastService.getPodcastsByPublisher(publisherId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Supprimer un podcast' })
  @ApiParam({ name: 'id', description: 'ID du podcast' })
  @ApiResponse({ status: 200, description: 'Podcast supprimé' })
  @ApiResponse({
    status: 403,
    description: 'Vous ne pouvez pas supprimer ce podcast',
  })
  @ApiResponse({ status: 404, description: 'Podcast non trouvé' })
  async deletePodcast(@Req() req, @Param('id') id: number) {
    return this.podcastService.deletePodcast(id, req.user.id);
  }
}
