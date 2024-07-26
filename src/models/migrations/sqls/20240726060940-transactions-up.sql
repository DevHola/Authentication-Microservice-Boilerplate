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
