import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Bonjour à tous !' })
  content: string;

  @ApiProperty({ example: '2025-10-25T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({
    example: {
      id: 1,
      username: 'john_doe',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    },
  })
  sender: {
    id: number;
    username: string;
    avatar: string;
  };
}
