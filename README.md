# Sapia-Auth

## Table of Contents
  <ol>
    <li><a href="#Introduction"> Introduction</a></li>
    <li><a href="#Stories">Stories</a></li>
    <li><a href="#Requirements">Requirements</a></li>
    <li><a href="#Design">Design</a></li>
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
2. Use MongoDB (You can design your own data structure, just create your own seed data.
No need to do user signup).
3. Unit testing is required
4. Integration testing is required
5. Dockerize your code and your database
6. Upload your project to github and write a proper readme

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
When mongodb container created, the script **mongo-init.sh** will be invoked automatically to initalize the db collection and insert dummy data
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
