import { type Knex } from 'knex'

export async function seed (knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('usertype').del()

  // Inserts seed entries
  await knex('usertype').insert([
    { name: 'Merchant', description: 'Merchants are businesses or individuals that accept payments through the e-wallet system. They can receive payments from users for goods or services and may have additional features to manage transactions, view transaction history, and access reports. Merchants might also need to integrate their e-wallet with their point-of-sale systems or online storefronts.' },
    { name: 'User', description: 'Users are individuals who use the e-wallet to make payments, transfer funds, and manage their account. They can link their bank accounts or credit/debit cards to their e-wallet for transactions. Users may have features such as viewing transaction history, managing payment methods, and setting up recurring payments. They interact primarily with the consumer-facing aspects of the e-wallet.' },
    { name: 'Support', description: 'Support users are responsible for assisting both merchants and users with any issues or questions they might have. They have access to support tools and dashboards to handle inquiries, resolve disputes, and provide assistance with technical or account-related problems. Support staff may have access to more detailed transaction data and user account information to effectively resolve issues.' }
  ])
};
