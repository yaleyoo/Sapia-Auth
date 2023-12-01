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