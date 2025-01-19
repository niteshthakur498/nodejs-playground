const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'node-consumer',
  brokers: ['localhost:9094'] // Replace with your broker addresses
});

const consumer = kafka.consumer({ groupId: 'my-group-2' });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'test-topic', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(`Received message: ${message.value.toString()}`);
    },
  });
};

const shutdown = async () => {
  console.log('Shutting down...');
  await consumer.disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

run().catch(console.error);
