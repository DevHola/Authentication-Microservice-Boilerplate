import amqp, { type Connection, type Channel } from 'amqplib'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createMQProducer = async (url: string, queueName: string, exchangeName: string, routekey: string) => {
  console.log('Connecting to RabbitMQ...')
  const exchangeType: string = 'direct'
  try {
    const connection: Connection = await amqp.connect(url)
    const channel: Channel = await connection.createChannel()

    console.log('Connected to RabbitMQ')

    await channel.assertExchange(exchangeName, exchangeType, { durable: true })

    // Assert queue to ensure it exists
    await channel.assertQueue(queueName, {
      durable: true
    })
    await channel.bindQueue(queueName, exchangeName, routekey)

    return (msg: string) => {
      console.log('Producing message to RabbitMQ...')
      channel.publish(exchangeName, routekey, Buffer.from(msg))
    }
  } catch (error) {
    console.log('Error connecting to RabbitMQ:', error)
    throw error
  }
}
export default createMQProducer
