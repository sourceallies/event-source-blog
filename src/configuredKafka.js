const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'event-source-blog',
    brokers: ['localhost:9092']
});

const producer = kafka.producer();
const consumer = kafka.consumer.bind(kafka);

module.exports = {
    kafka,
    consumer,
    producer
};