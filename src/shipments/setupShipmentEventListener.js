
const shipmentEventReducer = require('./events/reducer');
const mongoClient = require('../configuredMongoClient');
const kafka = require('../configuredKafka');
const IllegalShipmentStateError = require('./events/IllegalShipmentStateError');
const publishEvent = require('./events/publishEvent');
const loadShipment = require('./loadShipment');

async function saveShipment(shipment) {
    const {_id} = shipment;
    await mongoClient.db('shipment')
        .collection('shipments')
        .replaceOne({_id}, shipment, {upsert: true});
}

async function reverseEvent(event) {
    const eventTimestamp = new Date(Date.now()).toISOString();
    const reversalEvent = {
        _id: `${event.shipmentId}-${eventTimestamp}`,
        shipmentId: event.shipmentId,
        eventTimestamp,
        eventType: 'reverse-event',
        reversedEvent: event
    };
    await publishEvent(reversalEvent);
}

async function eachMessage({ message }) {
    const event = JSON.parse(message.value);
    const eventTimestamp = new Date(+message.timestamp).toISOString();
    const eventWithTimestap = {
        ...event,
        eventTimestamp
    };

    const loadedShipment = await loadShipment(event.shipmentId);
    try {
        const updatedShipment = shipmentEventReducer(loadedShipment, eventWithTimestap);
        await saveShipment(updatedShipment);
        console.log('updated shipment: ', updatedShipment);
    } catch (e) {
        if (e instanceof IllegalShipmentStateError) {
            await reverseEvent(event);
            console.warn('Cannot reduce event ' + e);
        } else {
            throw e;
        }
    }
}

module.exports = async function setupShipmentEventListener() {
    const consumer = kafka.consumer({ groupId: 'shipment-events-to-shipment' });
    await consumer.connect();
    await consumer.subscribe({ topic: 'shipment-events' });
    await consumer.run({eachMessage});
};