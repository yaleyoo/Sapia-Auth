
import { Model } from 'mongoose';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { LoginDto } from 'src/modules/user/dtos/LoginDTO';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import * as CryptoJS from 'crypto-js';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { UserStatus } from 'src/enum/UserStatus';


@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>, 
        @InjectConnection() private connection: Connection,
        @InjectRedis() private readonly redis: Redis,
        ) { }

    async findAll(): Promise<User[]> {
        return this.userModel.find();
    }


    async login(loginDto: LoginDto): Promise<string> {
        let user = await this.userModel.findOne({
            username: loginDto.username
        });
        
        // user not exist 
        if (!user) {
            throw new HttpException("Username or password not found", HttpStatus.UNAUTHORIZED);
        } 

        // user is locked
        if (user.status === UserStatus.LOCKED) {
            throw new HttpException("Your account is locked, please contact admin to verify your identity.", HttpStatus.FORBIDDEN);
        }

        // password mismatch, log attampt in redis
        if (user.password !== CryptoJS.MD5(loginDto.password).toString()) {
            this.attemptFailed(loginDto);
            throw new HttpException("Username or password not found", HttpStatus.UNAUTHORIZED);
        }

        return jwt.sign({ username: loginDto.username, issuer: 'sapia-auth', subject: 'sapia-apps', scope: '*' }, process.env.TOKEN_SECRET, { expiresIn: process.env.TOKEN_EXPIRE });
    }

    async attemptFailed(loginDto: LoginDto) {
        let attempts:number = parseInt(await this.redis.get(loginDto.username)) || 0 ;
        
        // first faild attempt
        if (attempts == 0) this.redis.set(loginDto.username, 1, 'EX', 300);
        // set attempt = attempt + 1, keep TTL NOTICE: only works for REDIS >= 6.0
        else if (attempts <= 2) this.redis.set(loginDto.username, attempts+1, 'KEEPTTL')
        else {
            await this.userModel.findOneAndUpdate({username: loginDto.username}, {status: UserStatus.LOCKED}, {new: true})
            console.log(`Account ${loginDto.username} locked`)
        }
    }
}

