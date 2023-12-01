import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './modules/user/user.module';

@Module({
  imports: [
    MongooseModule.forRoot(`mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?authMechanism=DEFAULT`), 

    // MongooseModule.forRoot(`mongodb://mongo:mongo@mongo_local:27017/sapia?authMechanism=DEFAULT`), 
    UsersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
