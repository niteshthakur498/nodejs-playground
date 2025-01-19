const { Kafka } = require('kafkajs');
const fs = require('fs');

const kafka = new Kafka({
  clientId: 'my-producer',
  brokers: ['localhost:39092'], // Replace with your broker's address
  ssl: {
    rejectUnauthorized: true,
    ca: [fs.readFileSync('/home/nitesh/Documents/PersonalProjects/docker_help/TEST/Kafka_confluentStack_with_SSL/TEST_2/ca.crt')] // Replace with the path to your broker's certificate or same ca.crt used to create keystore
  }
});

const producer = kafka.producer();

const runProducer = async () => {
  try {
    await producer.connect();
    console.log('Producer connected to Kafka.');

    await producer.send({
      topic: 'my-topic',
      messages: [{ value: 'kafka Message from node through SSL 1234' }]
    });

    console.log('Messages sent successfully.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await producer.disconnect();
    console.log('Producer disconnected.');
  }
};

runProducer();


//echo "Hello Kafka 9" | kcat -b localhost:29092 -P -t my-topic
