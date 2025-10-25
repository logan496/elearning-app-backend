import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, IsBoolean, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'john_doe_updated',
    description: "Nouveau nom d'utilisateur",
  })
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    example: 'newemail@example.com',
    description: 'Nouvelle adresse email',
  })
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'NewPassword123!',
    description: 'Nouveau mot de passe',
  })
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({
    example: 'https://api.dicebear.com/7.x/avataaars/svg?seed=newavatar',
    description: 'URL du nouvel avatar',
  })
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Statut publisher',
  })
  @IsBoolean()
  isPublisher?: boolean;
}
