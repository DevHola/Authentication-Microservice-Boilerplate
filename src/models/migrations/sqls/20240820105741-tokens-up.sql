CREATE TABLE IF NOT EXISTS tokens (
    token_id SERIAL PRIMARY KEY,
    hash VARCHAR(255) not null,
    token_type_id SERIAL NOT NULL,
    user_id uuid NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user
       FOREIGN KEY (user_id)
       REFERENCES users (user_id),
    CONSTRAINT fk_token_type
       FOREIGN KEY (token_type_id)
       REFERENCES token_type (token_type_id)
);
