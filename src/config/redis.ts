import { createClient } from 'redis'

export const redisconnect = async (): Promise<any> => {
  if (process.env.REDIS_URL != null) {
    const client = createClient({ url: process.env.REDIS_URL })
    client.on('error', err => { console.log('Redis error', err) })
    return await client.connect()
  }
}

export const storeRefreshToken = async (accessToken: string, userId: string, refreshToken: string): Promise<void> => {
  const client = await redisconnect()
  const key = `${accessToken}|${userId}`
  await client.set(key, refreshToken, 'EX', process.env.AUTH_REFRESH_TOKEN_EXPIRY)
  await client.disconnect()
}

export const storeRVToken = async (Token: string, type: string, userId: string): Promise<void> => {
  const client = await redisconnect()
  const key = `${type}|${userId}`
  switch (type) {
    case 'Reset':
      await client.set(key, Token, 'EX', process.env.RESET_PASSWORD_TOKEN_EXPIRY_MINS)
      await client.disconnect()
      break
    case 'Verify':
      await client.set(key, Token, 'EX', process.env.RESET_PASSWORD_TOKEN_EXPIRY_MINS)
      await client.disconnect()
      break

    default:
      break
  }
}

export const deleteRVToken = async (key: string): Promise<void> => {
  const client = await redisconnect()
  await client.del(key)
  await client.disconnect()
}

export const getRVToken = async (Token: string, type: string, userId: string): Promise<boolean> => {
  const client = await redisconnect()
  const key = `${type}|${userId}`
  if (type === 'Verify') {
    const value = await client.get(key)
    await client.disconnect()
    await deleteRVToken(key)
    if (value === Token) {
      return true
    } else {
      return false
    }
  } else if (type === 'Reset') {
    const value = await client.get(key)
    await client.disconnect()
    await deleteRVToken(key)
    if (value === Token) {
      return true
    } else {
      return false
    }
  } else {
    await deleteRVToken(key)
    return false
  }
}

export const getRefreshToken = async (Token: string, userId: string): Promise<string> => {
  const client = await redisconnect()
  const key = `${Token}|${userId}`
  const value: string = await client.get(key)
  await client.disconnect()
  await deleteRVToken(key)
  if (value !== null) {
    return value
  } else {
    throw new Error('Authentication failed')
  }
}
