CREATE TABLE IF NOT EXISTS usertype (
    usertype_id SERIAL PRIMARY KEY,
    name VARCHAR(30) UNIQUE NOT NULL,
    description VARCHAR(200) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE IF NOT EXISTS users (
    user_id uuid UNIQUE DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    usertype SERIAL,
    isVerified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    last_login TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id),
    CONSTRAINT fk_usertype 
       FOREIGN KEY (usertype)
       REFERENCES usertype (usertype_id)
);


CREATE TABLE IF NOT EXISTS wallet (
    wallet_id SERIAL UNIQUE PRIMARY KEY,
    Balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
    wallet_address VARCHAR(255) UNIQUE NOT NULL,
    user_id uuid,
    CONSTRAINT fk_user
       FOREIGN KEY (user_id)
       REFERENCES users (user_id)
);
CREATE TABLE IF NOT EXISTS cards (
    card_id SERIAL UNIQUE PRIMARY KEY,
    user_id uuid,
    card_number VARCHAR(20) NOT NULL,
    expiration_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user
       FOREIGN KEY (user_id)
       REFERENCES users (user_id)
);
CREATE TABLE IF NOT EXISTS transaction_type (
    transaction_type_id SERIAL UNIQUE PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_type_id SERIAL,
    wallet_id SERIAL,
    user_id uuid,
    amount DECIMAL(12, 2) NOT NULL,
    transaction_status BOOLEAN DEFAULT FALSE,
    qr_code VARCHAR(255) NOT NULL,
    recipient uuid,
    external_reference VARCHAR(255), 
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transaction_type
       FOREIGN KEY (transaction_type_id)
       REFERENCES transaction_type (transaction_type_id),
    CONSTRAINT fk_user
       FOREIGN KEY (user_id)
       REFERENCES users (user_id),
    CONSTRAINT fk_recipent
       FOREIGN KEY (recipient)
       REFERENCES users (user_id),
    CONSTRAINT fk_wallet
       FOREIGN KEY (wallet_id)
       REFERENCES wallet (wallet_id)
);
CREATE TABLE IF NOT EXISTS transaction_detail (
    td_id SERIAL PRIMARY KEY,
    transaction_id uuid,
    user_previous_balance DECIMAL(12, 2) NOT NULL,
    user_new_balance DECIMAL(12, 2) NOT NULL,
    recipent_previous_balance DECIMAL(12, 2) NOT NULL,
    recipent_new_balance DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transaction
       FOREIGN KEY (transaction_id)
       REFERENCES transactions (transaction_id)
);