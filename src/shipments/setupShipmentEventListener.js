
const shipmentEventReducer = require('./events/reducer');

module.exports = async function setupShipmentEventListener(server) {
    const consumer = server.app.kafka.consumer({ groupId: 'shipment-events-to-shipment' });
    await consumer.connect();
    await consumer.subscribe({ topic: 'shipment-events' });

    const collection = server.app.mongoClient
        .db('shipment')
        .collection('shipments');

    await consumer.run({
        eachMessage: async ({ message }) => {
            const event = JSON.parse(message.value);
            const _id = event.shipmentId;

            const loadedShipment = await collection.findOne({_id});
            const updatedShipment = shipmentEventReducer(loadedShipment, event);
            await collection.replaceOne({_id}, updatedShipment, {upsert: true});
            console.log('updated shipment: ', updatedShipment);
        }
    });
};