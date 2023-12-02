
import { InjectModel } from '@nestjs/mongoose';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User, UserSchema } from '../../src/modules/user/schemas/user.schema';
import { Model } from 'mongoose';


@Injectable()
export class RedisAndMongoMock {
    constructor(
        @InjectRedis() public readonly redis: Redis,
        @InjectModel(User.name) public userModel: Model<User>, 
    ) { }
}