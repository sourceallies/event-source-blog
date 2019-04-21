const { Kafka } = require('kafkajs');

module.exports = async function setupKafka(server) {
    const kafka = new Kafka({
        clientId: 'event-source-blog',
        brokers: ['localhost:9092']
    });

    server.app.kafka = kafka;

    const producer = kafka.producer();
    await producer.connect();
    server.app.producer = producer;
};