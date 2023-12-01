
import { Model, connect } from 'mongoose';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { LoginDto } from 'src/modules/user/dtos/LoginDTO';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import * as CryptoJS from 'crypto-js'

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<User>, @InjectConnection() private connection: Connection) { }

    async findAll(): Promise<User[]> {
        return this.userModel.find();
    }


    async login(loginDto: LoginDto): Promise<string> {
        let user = await this.userModel.findOne({
            username: loginDto.username, 
            password: CryptoJS.MD5(loginDto.password).toString()
        });
        if (!user) {
          throw new HttpException("Username or password not found", HttpStatus.UNAUTHORIZED);
        }

        return jwt.sign({ username: loginDto.username, issuer: 'sapia-auth', subject: 'sapia-apps', scope: '*' }, process.env.TOKEN_SECRET, { expiresIn: process.env.TOKEN_EXPIRE });
    }
}

