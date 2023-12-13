
import { Model } from 'mongoose';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../user/schemas/user.schema';
import { LoginDto } from './dtos/LoginDTO';
import * as jwt from 'jsonwebtoken';
import * as CryptoJS from 'crypto-js';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { UsersService } from '../user/user.service';
import { UserStatus } from '../../enum/UserStatus';


@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>, 
        private readonly userSerice: UsersService,
        @InjectRedis() private readonly redis: Redis,
        ) { }

    async login(loginDto: LoginDto): Promise<string> {
        let user = await this.userSerice.findUser(loginDto.username)
        
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

        return jwt.sign({ username: loginDto.username, issuer: 'sapia-auth', subject: 'sapia-apps', scope: '*' }, process.env.TOKEN_SECRET || 'default_secret', { expiresIn: process.env.TOKEN_EXPIRE || '1h' });
    }

    async attemptFailed(loginDto: LoginDto) {
        // WARN: could have concurrency issue (dirty read etc.) but in this senario should be fine.
        let attempts:number = parseInt(await this.redis.get(loginDto.username)) || 0 ;
        
        // first faild attempt
        if (attempts == 0) this.redis.set(loginDto.username, 1, 'EX', 300);
        // set attempt = attempt + 1, keep TTL NOTICE: only works for REDIS >= 6.0
        else if (attempts < 2) this.redis.set(loginDto.username, attempts+1, 'KEEPTTL')
        else {
            await this.userModel.findOneAndUpdate({username: loginDto.username}, {status: UserStatus.LOCKED}, {new: true})
            console.log(`Account ${loginDto.username} locked`)
        }
    }
}

