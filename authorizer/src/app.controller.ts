import { Body, Controller, Get, Post, Res, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { LoginDto } from './modules/user/dtos/LoginDTO';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
