import { Body, Controller, Get, Post, Res, HttpStatus } from '@nestjs/common';
import { UsersService } from './user.service';
import { LoginDto } from './dtos/LoginDTO';
import { User } from './schemas/user.schema';

@Controller('auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  login(@Body() loginDto: LoginDto): Promise<string> {
    return this.usersService.login(loginDto);
  }
}
