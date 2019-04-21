

module.exports = async function setupSaveEventListener(server) {
    const consumer = server.app.kafka.consumer({ groupId: 'test-group' });
    await consumer.connect();
    await consumer.subscribe({ topic: 'shipment-events' });

    const shipmentEventsCollection = server.app.mongoClient
        .db('shipment')
        .collection('shipment_events');

    await consumer.run({
        eachMessage: async ({ message }) => {
            const event = JSON.parse(message.value);
            console.log('Got event: ', event);
            await shipmentEventsCollection.insertOne(event);
        }
    });
};