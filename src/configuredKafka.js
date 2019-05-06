const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'event-source-blog',
    brokers: ['localhost:9092']
});

const producer = kafka.producer();

module.exports = {
    kafka,
    producer
};