const { Kafka } = require('kafkajs');
const fs = require('fs');

const kafka = new Kafka({
  clientId: 'node-consumer',
  brokers: ['localhost:39092'] ,// Replace with your broker addresses
  ssl: {
    rejectUnauthorized: true,
    ca: [fs.readFileSync('/home/nitesh/Documents/PersonalProjects/docker_help/TEST/Kafka_confluentStack_with_SSL/TEST_2/ca.crt')] // Replace with the path to your broker's certificate
    }
});

const consumer = kafka.consumer({ groupId: 'my-group-2' });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'my-topic', fromBeginning: true });

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


//kcat -b localhost:29092 -C -t my-topic
