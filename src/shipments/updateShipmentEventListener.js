
const shipmentEventReducer = require('./events/reducer');
const mongoClient = require('../configuredMongoClient');
const IllegalShipmentStateError = require('./events/IllegalShipmentStateError');
const publishEvent = require('./events/publishEvent');
const loadShipment = require('./loadShipment');

async function saveShipment(shipment) {
    const {_id} = shipment;
    await mongoClient.db('shipment')
        .collection('shipments')
        .replaceOne({_id}, shipment, {upsert: true});
}

async function tombstoneEvent(event) {
    const eventTimestamp = new Date(Date.now()).toISOString();
    const reversalEvent = {
        _id: `${event.shipmentId}-${eventTimestamp}`,
        shipmentId: event.shipmentId,
        eventTimestamp,
        eventType: 'tombstone',
        reversedEvent: event
    };
    await publishEvent(reversalEvent);
}

function getEventFromMessage({value, timestamp}) {
    const eventTimestamp = new Date(+timestamp).toISOString();
    return {
        ...JSON.parse(value),
        eventTimestamp
    };
}

function eventAlreadyProcessed(shipment, eventTimestamp) {
    return shipment &&
        shipment.lastEventTimestamp &&
        Date.parse(shipment.lastEventTimestamp) >= eventTimestamp;
}

async function eachMessage({ message }) {
    const event = getEventFromMessage(message);

    const loadedShipment = await loadShipment(event.shipmentId);
    if (eventAlreadyProcessed(loadedShipment, message.timestamp)) {
        return;
    }
    try {
        const updatedShipment = shipmentEventReducer(loadedShipment, event);
        await saveShipment(updatedShipment);
        console.log('updated shipment: ', updatedShipment);
    } catch (e) {
        if (e instanceof IllegalShipmentStateError) {
            await tombstoneEvent(event);
            console.warn('Cannot reduce event ' + e);
        } else {
            throw e;
        }
    }
}

module.exports = {
    groupId: 'shipment-events-to-shipment',
    topic: 'shipment-events',
    eachMessage
};