import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({
    example: 'john_doe',
    description: "Nom d'utilisateur unique",
  })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'Adresse email valide',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Mot de passe (minimum 6 caractères)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}
