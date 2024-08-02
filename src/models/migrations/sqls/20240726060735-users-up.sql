CREATE TABLE IF NOT EXISTS users (
    user_id uuid UNIQUE DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    usertype SERIAL,
    isVerified BOOLEAN NOT NULL DEFAULT FALSE,
    token TEXT [],
    reset_token VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    last_login TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id),
    CONSTRAINT fk_usertype 
       FOREIGN KEY (usertype)
       REFERENCES usertype (usertype_id)
);