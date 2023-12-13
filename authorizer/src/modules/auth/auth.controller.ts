import { Body, Controller, Get, Post } from '@nestjs/common';
import { LoginDto } from './dtos/LoginDTO';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  login(@Body() loginDto: LoginDto): Promise<string> {
    return this.authService.login(loginDto);
  }

}
