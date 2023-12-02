import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { LoginDto } from './dtos/LoginDTO';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from '@nestjs-modules/ioredis';
import { User, UserSchema } from './schemas/user.schema';
import { RedisAndMongoMock } from '../../../test/mocks/RedisAndMongoMock';
import * as CryptoJS from 'crypto-js';
import { UserStatus } from '../../enum/UserStatus';
import { HttpStatus } from '@nestjs/common';


describe('UsersController', () => {
    let usersController: UsersController;
    const dummy_username: string = 'test_user_usercontroller';
    const dummy_password: string = 'test_password'
    let mongod: MongoMemoryServer;
    let connections: RedisAndMongoMock;


    beforeEach(async () => {
        mongod = await MongoMemoryServer.create({});
        const app: TestingModule = await Test.createTestingModule({
            imports: [
                RedisModule.forRoot({
                    config: {
                        url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
                    },
                }),
                MongooseModule.forRoot(mongod.getUri()),
                MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
            ], 
            controllers: [UsersController],
            providers: [UsersService, RedisAndMongoMock],
        }).compile();


        usersController = app.get<UsersController>(UsersController);
        connections = app.get<RedisAndMongoMock>(RedisAndMongoMock);

        // insert dummy data
        connections.userModel.insertMany([
            {
                uuid: 'uuid02',
                username: dummy_username,
                password: CryptoJS.MD5(dummy_password).toString(),
                status: UserStatus.ACTIVE
            }
        ])
    });

    describe('user controller', () => {
        let loginDto = new LoginDto();
        loginDto.username = dummy_username;
        loginDto.password = dummy_password;

        it('success login should return token', async () => {
            expect(typeof await usersController.login(loginDto)).toBe("string")
        });

        it('attempt failed login 3 times to get account locked', async () => {
            loginDto.password = 'random_error_password';
            // should throw unauthorised error first 3 attempts
            for (let i = 0; i < 3; i++) {
                try {
                    await usersController.login(loginDto)

                    // should throw exception, otherwise failed test
                    expect(false).toBe(true)
                } catch (e) {
                    expect(e.status).toBe(HttpStatus.UNAUTHORIZED)
                } finally {
                    // wait for redis update
                    await new Promise(r => setTimeout(r, 100));
                }
            }


            // should throw forbidden error 4st attempts
            try {
                await usersController.login(loginDto)

                // should throw exception, otherwise failed test
                expect(false).toBe(true)
            } catch (e) {
                expect(e.status).toBe(HttpStatus.FORBIDDEN)
            }
        })
    });

    afterAll(async () => {
        await connections.redis.del(dummy_username)
        await mongod.stop();
    });
});
