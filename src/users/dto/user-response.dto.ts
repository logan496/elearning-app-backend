import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'john_doe' })
  username: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john' })
  avatar: string;

  @ApiProperty({ example: false })
  isPublisher: boolean;

  @ApiProperty({ example: '2025-10-25T12:00:00.000Z' })
  createdAt: Date;
}