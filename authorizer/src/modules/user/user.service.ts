
import { Model } from 'mongoose';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { LoginDto } from '../auth/dtos/LoginDTO';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';


@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>, 
        @InjectConnection() private connection: Connection,
        @InjectRedis() private readonly redis: Redis
        ) { }


    async findUser(username: string): Promise<User> {
        let user = await this.userModel.findOne({
            username: username
        });

        return user;
    }

}

