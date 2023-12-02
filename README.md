# Sapia-Auth

## Table of Contents
  <ol>
    <li><a href="#Introduction"> Introduction</a></li>
    <li><a href="#Stories">Stories</a></li>
    <li><a href="#Requirements">Requirements</a></li>
    <li><a href="#Design">Design</a></li>
    <li><a href="#Configs">Configs</a></li>
    <li><a href="#API-response">API response</a></li>
    <li><a href="#unit-tests">Unit tests</a></li>
    <li><a href="#e2e-tests">E2E tests</a></li>
  </ol>

## Introduction
You only need to implement one user login REST API. Below are some specific requirements.

## Stories
1. A user can login with a username and password
2. Return success and a JWT token if username and password are correct
3. Return fail if username and password are not matched
4. A user has a maximum of 3 attempts within 5 minutes, otherwise, the user will be locked.
5. Return fail if a user is locked

## Requirements
1. Use Nest.js framework and typescript is required.
2. Use MongoDB (You can design your own data structure, just create your own seed data. No need to do user signup).
3. Unit testing is required
4. Integration testing is required
5. Dockerize your code and your database
6. Upload your project to github and write a proper readme.

## How to run?
- In **Linux** or **MacOS**:
  Please use makefile as the entry, refer to <a href="#Configs">Configs</a>.
- In **Windows**:
  Please delete the docker-compose.yaml and rename the docker-compose-windows.yaml to docker-compose.yaml, then run command:
  ```
  docker-compose up --detach --remove-orphans --build
  ```  

## Design
Tech Stack: Nest.js + docker + mongodb + redis

### MongoDB v7.0

#### Data Structure
```
uuid: "Universally Unique IDentifier"
username: "username"
password: "a md5 encoded password string"
creation_date: "timestamp of account creation time"
last_login: "timestamp of last login time"
status: "Enumerate indicating account status, 0-Locked, 1-Active"
```
![image](https://github.com/yaleyoo/Sapia-Auth/assets/19161443/a5488c98-cfa7-42ba-b9d4-03562039ac51)

#### Initializing Database
When Mongodb container created, the script **mongo-init.sh** will be invoked automatically to initialize the db collection and insert dummy data
docker-entrypoint-initdb.d/mongo-init.sh
```
set -e

echo 

mongosh -u $MONGO_INITDB_ROOT_USERNAME -p $MONGO_INITDB_ROOT_PASSWORD <<EOF
use $MONGO_INITDB_DATABASE

db.createUser(
    {
        user: '$MONGO_INITDB_ROOT_USERNAME',
        pwd: '$MONGO_INITDB_ROOT_PASSWORD',
        roles: [
            {
                role: "readWrite",
                db: '$MONGO_INITDB_DATABASE'
            }
        ]
    }
);

db.createCollection('users', { capped: false });

db.users.insert([
    { 
        "uuid": "uuid_001",
        "username": "demo_user",
        "password": "813ec4fed5876061b8fa468b7f309aa8",
        "creation_date": "2023-11-30",
        "last_login": "2023-11-30",
        "status": 1 
    }
]);
EOF
```


### Redis v7.0.0 (could be Dynamodb for serverless & cloud-based solution)
** Redis is used for storing the failed login attempt in 5 minutes using the TTL feature which is only available for Redis version >= 6.0.0) **
key-value pair as below, and will expire after TTL. Updating the value should not reset the TTL.
```
username: number of failed attempts [0-3)
```
![image](https://github.com/yaleyoo/Sapia-Auth/assets/19161443/9e28a646-e960-4cf2-a9e7-c5f92e0f15c1)

### Nest.js app (API)
** application should be built in the environment with node version >= 18.0 **

## Configs

### Makefile
Please initiate/stop/clean the containers with the Makefile.
> **make refresh** - this command will initiate the containers
> 
> **make log** - this command will continuously print the log from all containers in real-time
>
> **make start** - this command will start all of the stopped containers
>
> **make stop** - this command will stop all running containers
>
> **make down** - this command will stop and clean all containers

### docker-compose.yaml
**redis and mongodb are persistent in Docker local volumn**
```
version: '3'

services:
  mongo_local:
    container_name: mongo_local
    image: mongo:7.0
    ports:
      - '${DB_PORT}:${DB_PORT}'
    volumes:
      - ./docker-entrypoint-initdb.d/mongo-init.sh:/docker-entrypoint-initdb.d/mongo-init.sh:ro
      - mongo_local:/data
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${DB_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${DB_PASSWORD}
      - MONGO_INITDB_DATABASE=${MONGO_INITDB_DATABASE}   
    networks:
      - sapia-network
  
  # could be dynamodb
  redis_local:
    container_name: redis_local
    image: redis:7.0.0
    restart: always
    volumes:
      - redis_local:/data
    ports:
      - '${REDIS_PORT}:${REDIS_PORT}'
    networks:
      - sapia-network

  sapia_authorizer:
    container_name: sapia_authorizer
    build:
      context: ./authorizer
    image: sapia_authorizer
    ports:
      - '3000:3000'
    environment:
      - DB_HOST=${DB_HOST}
      - DB_PORT=${DB_PORT}
      - DB_NAME=${MONGO_INITDB_DATABASE}
      - DB_USERNAME=${DB_USERNAME}
      - DB_PASSWORD=${DB_PASSWORD}
      - TOKEN_EXPIRE=${TOKEN_EXPIRE}
      - TOKEN_SECRET=${TOKEN_SECRET}
      - REDIS_HOST=${REDIS_HOST}
      - REDIS_PORT=${REDIS_PORT}
    networks:
      - sapia-network

networks:
  sapia-network:
    driver: bridge

volumes:
  redis_local:
    driver: local
  mongo_local:
    driver: local
```
## API response
### When successful login, an access token will be responded (the token is validated for 1 hour by default
![image](https://github.com/yaleyoo/Sapia-Auth/assets/19161443/83eac623-77ad-4125-8a58-e7e2a56e2817)
![image](https://github.com/yaleyoo/Sapia-Auth/assets/19161443/faacf2f5-57fe-4011-81c6-27ec6a7cdcb2)
### When the wrong credential is provided, including the inexistent username or mismatched credentials, the request fails with HTTP status code 401, and a message "username or password not found"
![image](https://github.com/yaleyoo/Sapia-Auth/assets/19161443/e5d220d8-f2c1-4a02-afdd-6e889eac7a75)
### When more than 3 times unsuccessful tries on the same account, the account will be locked. The request fails with HTTP status code 403, and a message "Your account is locked, please contact admin to verify your identity."
![image](https://github.com/yaleyoo/Sapia-Auth/assets/19161443/dc90b74a-48e4-4f50-bed0-513625ca8599)

## unit-tests(include service test and controller test)
![image](https://github.com/yaleyoo/Sapia-Auth/assets/19161443/ff6989f3-9c9c-4a80-b50e-033d2ddc36c8)

## end to end tests
![image](https://github.com/yaleyoo/Sapia-Auth/assets/19161443/5156ba8e-f470-4d2f-a599-3370cff29835)



