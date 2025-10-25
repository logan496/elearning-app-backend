import { ApiProperty } from '@nestjs/swagger';

export class PodcastResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Introduction à JavaScript' })
  title: string;

  @ApiProperty({ example: 'Apprenez les bases de JavaScript' })
  description: string;

  @ApiProperty({ example: '30 min' })
  duration: string;

  @ApiProperty({ example: 'https://example.com/audio.mp3' })
  audioUrl: string;

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  imageUrl: string;

  @ApiProperty({ example: 150 })
  views: number;

  @ApiProperty({ example: '2025-10-25T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({
    example: {
      id: 1,
      username: 'john_doe',
      email: 'john@example.com',
    },
  })
  publisher: {
    id: number;
    username: string;
    email: string;
  };
}
