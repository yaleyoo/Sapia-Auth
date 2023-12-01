db.createUser(
    {
        user: "mongo",
        pwd: "mongo",
        roles: [
            {
                role: "readWrite",
                db: "sapia"
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