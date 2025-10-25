import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: "Inscription d'un nouvel utilisateur" })
  @ApiResponse({
    status: 201,
    description: 'Utilisateur créé avec succès',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Email ou username déjà utilisé' })
  async signup(@Body() signupDto: SignupDto): Promise<AuthResponseDto> {
    return this.authService.signup(
      signupDto.email,
      signupDto.username,
      signupDto.password,
    );
  }

  @Post('login')
  @ApiOperation({ summary: "Connexion d'un utilisateur" })
  @ApiResponse({
    status: 200,
    description: 'Connexion réussie',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Email ou mot de passe incorrect' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto.email, loginDto.password);
  }
}
