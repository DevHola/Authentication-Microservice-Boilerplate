CREATE TABLE IF NOT EXISTS token_type (
    token_type_id SERIAL PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP 
);

INSERT INTO
    token_type (name)
VALUES
    ('Refresh_token');
INSERT INTO
    token_type (name)
VALUES
    ('Reset_token');
INSERT INTO
    token_type (name)
VALUES
    ('Verify_token');