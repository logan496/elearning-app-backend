import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class SendGeneralMessageDto {
  @ApiProperty({
    example: 'Bonjour à tous !',
    description: 'Contenu du message',
  })
  @IsString()
  @MinLength(1)
  content: string;
}
