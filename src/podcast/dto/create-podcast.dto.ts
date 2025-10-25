import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUrl, MinLength } from 'class-validator';

export class CreatePodcastDto {
  @ApiProperty({
    example: 'Introduction à JavaScript',
    description: 'Titre du podcast',
  })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({
    example: 'Apprenez les bases de JavaScript en 30 minutes',
    description: 'Description du podcast',
  })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({
    example: '30 min',
    description: 'Durée du podcast',
  })
  @IsString()
  duration: string;

  @ApiProperty({
    example: 'https://example.com/podcasts/js-intro.mp3',
    description: 'URL du fichier audio',
  })
  @IsUrl()
  audioUrl: string;

  @ApiPropertyOptional({
    example: 'https://example.com/images/js-podcast.jpg',
    description: "URL de l'image de couverture",
  })
  @IsUrl()
  imageUrl?: string;
}
