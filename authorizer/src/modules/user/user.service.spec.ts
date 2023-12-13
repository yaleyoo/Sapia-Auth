import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from "./user.service";
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from '@nestjs-modules/ioredis';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User, UserSchema } from './schemas/user.schema';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as CryptoJS from 'crypto-js';
import { LoginDto } from '../auth/dtos/LoginDTO';
import { UserStatus } from '../../enum/UserStatus';
import { RedisAndMongoMock } from '../../../test/mocks/RedisAndMongoMock';


describe('UsersService', () => {
    let service: UsersService;
    let connections: RedisAndMongoMock;
    let mongod: MongoMemoryServer;

    const dummy_username: string = 'test_user_userservice';
    const dummy_password: string = 'test_password'

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
            providers: [UsersService, RedisAndMongoMock]
        }).compile();

        service = app.get<UsersService>(UsersService);
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


    describe('test Fn attemptFailed', () => {
        it('attempt failed login once', async () => {
            let loginDto = new LoginDto();
            loginDto.username = dummy_username;
            loginDto.password = dummy_password;

            await service.attemptFailed(loginDto)

            expect(parseInt(await connections.redis.get(dummy_username))).toBe(1)

        })
    })

    describe('test Fn login', () => {
        let loginDto = new LoginDto();
        loginDto.username = dummy_username;
        loginDto.password = dummy_password;


        it('successfully login', async () => {
            loginDto.password = dummy_password;
            expect(typeof await service.login(loginDto)).toBe("string")
        })

        it('attempt failed login 3 times within 5 mins', async () => {
            loginDto.password = 'random_error_password';
            // should throw unauthorised error first 2 attempts
            for (let i = 0; i < 2; i++) {
                try {
                    await service.login(loginDto)

                    // should throw exception, otherwise failed test
                    expect(false).toBe(true)
                } catch (e) {
                    expect(e.status).toBe(HttpStatus.UNAUTHORIZED)
                } finally {
                    // wait for redis update
                    await new Promise(r => setTimeout(r, 100));
                }
            }


            // should throw forbidden error 3st attempts
            try {
                await service.login(loginDto)

                // should throw exception, otherwise failed test
                expect(false).toBe(true)
            } catch (e) {
                expect(e.status).toBe(HttpStatus.FORBIDDEN)
            }
        })

    })

    afterAll(async () => {
        await connections.redis.del(dummy_username)
        await mongod.stop();
    });
})