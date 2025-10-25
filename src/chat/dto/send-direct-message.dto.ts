import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, MinLength } from 'class-validator';

export class SendDirectMessageDto {
  @ApiProperty({
    example: 2,
    description: 'ID du destinataire',
  })
  @IsNumber()
  recipientId: number;

  @ApiProperty({
    example: 'Salut, comment ça va ?',
    description: 'Contenu du message',
  })
  @IsString()
  @MinLength(1)
  content: string;
}
