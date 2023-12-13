import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './user.service';
import { LoginDto } from '../auth/dtos/LoginDTO';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


}
