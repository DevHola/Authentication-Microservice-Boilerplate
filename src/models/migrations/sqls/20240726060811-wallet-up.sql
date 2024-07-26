CREATE TABLE IF NOT EXISTS wallet (
    wallet_id SERIAL UNIQUE PRIMARY KEY,
    Balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
    wallet_address VARCHAR(255) UNIQUE NOT NULL,
    user_id uuid,
    CONSTRAINT fk_user
       FOREIGN KEY (user_id)
       REFERENCES users (user_id)
);