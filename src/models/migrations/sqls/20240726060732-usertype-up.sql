CREATE TABLE IF NOT EXISTS usertype (
    usertype_id SERIAL PRIMARY KEY,
    name VARCHAR(30) UNIQUE NOT NULL,
    description VARCHAR(500) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP 
);

INSERT INTO
    usertype (name,description)
VALUES
    ('Merchant','Merchants are businesses or individuals that accept payments through the e-wallet system. They can receive payments from users for goods or services and may have additional features to manage transactions, view transaction history, and access reports. Merchants might also need to integrate their e-wallet with their point-of-sale systems or online storefronts');
INSERT INTO
    usertype (name, description)
VALUES
    ('User','Users are individuals who use the e-wallet to make payments, transfer funds, and manage their account. They can link their bank accounts or credit/debit cards to their e-wallet for transactions. Users may have features such as viewing transaction history, managing payment methods, and setting up recurring payments. They interact primarily with the consumer-facing aspects of the e-wallet');
INSERT INTO
    usertype (name,description)
VALUES
    ('Support', 'Support users are responsible for assisting both merchants and users with any issues or questions they might have. They have access to support tools and dashboards to handle inquiries, resolve disputes, and provide assistance with technical or account-related problems. Support staff may have access to more detailed transaction data and user account information to effectively resolve issues.');
