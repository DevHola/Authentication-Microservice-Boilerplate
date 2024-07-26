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