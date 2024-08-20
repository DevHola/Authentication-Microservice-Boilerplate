import pg from 'pg'
const { Pool } = pg
export const pool = new Pool({
  user: 'dev',
  password: '12345678',
  host: 'localhost',
  port: 5432,
  database: 'Banking'
})

// export const pool = new Pool({
//   user: 'avnadmin',
//   password: 'AVNS_tAJwNXD0KCZhLl8F4B9',
//   host: 'pg-user-service-fawaz0633-7eb3.i.aivencloud.com',
//   port: 14244,
//   database: 'user-service',
//   ssl: {
//     rejectUnauthorized: true,
//     ca: `-----BEGIN CERTIFICATE-----
// MIIEQTCCAqmgAwIBAgIUcCfQrn6lWOKSN3W5MmwcszWkZk4wDQYJKoZIhvcNAQEM
// BQAwOjE4MDYGA1UEAwwvZjk0NjBhNTUtZDBkMi00YWUwLTgxNTAtYWM2NDhjMzdj
// MzYxIFByb2plY3QgQ0EwHhcNMjQwODE5MTcyNDU3WhcNMzQwODE3MTcyNDU3WjA6
// MTgwNgYDVQQDDC9mOTQ2MGE1NS1kMGQyLTRhZTAtODE1MC1hYzY0OGMzN2MzNjEg
// UHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBAKJ2xwyC
// E+62WxLzd22pq53oSWz7Yk6N2MmLOn0EzHKrtlRwnrYvJacDny+tM7QLy1h3SURQ
// BFdZfj3FkATeHj9iq+4KimkEefuEAYPguVXNrMCzsoK/n2vPP0YNlBfWWYK7qwhH
// ysMJA6WGmohIFp3FbfVrPSRWYjyCbgWIFTk3P2ZabknrvPxyejGKDFtN6YmrOfbo
// MoZdChBSSUqRjz1afKUIa+ISdK+kFTF5cS1NH8YxPNg9JzkcmxLbLfXCAtKVw017
// 7pqAfI5zAez5TqOQEI/Mjn56nv66GS+g+3RVOCVPaLnX3Le0Mxeh3hO2CheJrwDV
// iMnSaX4hyoCzsPXahRLcMq4kMQm9YsPHL7H0KmP1w0yXuLokwVXJ7Ui2SIzPuGHN
// TYNu5PKfrMTT52XqePnkCpZk8J5RLF7J7EmEZy4YbQasCC1nC2dFu3gSWjG8qrZ/
// BOy3GSYB/dnv6CXcx+XS2sn6mj96uwUr0Zu3jGECr+JoJeq0W+8y2OLB8QIDAQAB
// oz8wPTAdBgNVHQ4EFgQU4QLYXGFUcVRNB8N1bm0Q/vhvmHcwDwYDVR0TBAgwBgEB
// /wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQADggGBAACd5cIltkDQYr+R
// Ra0QYYMOZhB3MWS0fvmwhWCzCXnFLG34B5wgJaaDtxYQUuSqQ1mBA+72jP2VcxCj
// 8FiA5XgVfzGx5ljnWZBHa2+O2OKUqi5jXZ6mRLED+rpQiCooXrFRYGJokHPRi3kL
// jTAsIfvUsLUDzxwOA+O4QETONHFC6xFEHCVqnq09+9f9e2SnPaBgLYvZB2icT085
// m05gEDL8XZfLuNmyM1SsJ86NxZqfznLsfpP3N9ojPpcApKWOH7Tpl3cYskPaYxdO
// SZezR8k1vRas82HfKYxwNvccHSVS/kPGRo7sFhIgen6UfuY5/+3xiCfsU8cfjcH2
// rG/XjUSWCfQOMH+zNrLkjGXbBVwYoXU5TvBu/Kb87pKSF0zmuk0BYJ+eOcAoVit9
// z568W0yv/EIsDJv/9RCGMhDFquBWfMW1R9V6otnPVy0ilwt112ZwhIcKP1R+rcmR
// tYjv28rJgUcJS4iPAMYu76afG+xdz/iKJhjyQdal77VDVGlmxQ==
// -----END CERTIFICATE-----`
//   }
// })
pool.connect((error, client, release) => {
  if (error != null) {
    console.log('connection failed', error.stack)
  } else {
    console.log('connection successful')
    release()
  }
})
export const checkAndMigrateDatabase = async (): Promise<void> => {
  try {
    const res = await pool.query(
      "SELECT to_regclass('public.migrations') AS exists"
    )

    if (res.rows[0].exists === null) {
      console.log('Migrations table not found. Running migrations...')
    } else {
      console.log('Migrations table found. Skipping migration.')
    }
  } catch (err) {
    console.error('Error checking database:', err)
  }
}
// postgres-migrations
// knex
// node-pg-migrate
