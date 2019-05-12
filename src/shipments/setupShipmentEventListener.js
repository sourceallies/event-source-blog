
const shipmentEventReducer = require('./events/reducer');
const mongoClient = require('../configuredMongoClient');
const kafka = require('../configuredKafka');

async function eachMessage({ message }) {
    const event = JSON.parse(message.value);
    const _id = event.shipmentId;
    const collection = mongoClient.db('shipment')
        .collection('shipments');

    const loadedShipment = await collection.findOne({_id});
    const updatedShipment = shipmentEventReducer(loadedShipment, event);
    await collection.replaceOne({_id}, updatedShipment, {upsert: true});
    console.log('updated shipment: ', updatedShipment);
}

module.exports = async function setupShipmentEventListener(server) {
    const consumer = kafka.consumer({ groupId: 'shipment-events-to-shipment' });
    await consumer.connect();
    await consumer.subscribe({ topic: 'shipment-events' });
    await consumer.run({eachMessage});
};