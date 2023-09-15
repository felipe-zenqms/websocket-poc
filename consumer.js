const runConsumer = async (consumer, onMessage) => {
  await consumer.connect()
  await consumer.subscribe({ topic: 'websocket-poc' })

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.warn(`${new Date().toISOString()} - Receiving message from Kafka: ${JSON.stringify(message.value.toString())}`)

      const obj = JSON.parse(message.value)
      onMessage(obj.id, obj.value)
    },
  })
}

module.exports = { runConsumer }