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
