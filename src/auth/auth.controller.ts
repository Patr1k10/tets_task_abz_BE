import { Body, Controller, Get, Post, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Get('token')
  async getToken(): Promise<string> {
    return await this.authService.generateTokens();
  }
}
