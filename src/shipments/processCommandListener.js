
const reducer = require('./commands/reducer');
const mongoClient = require('../configuredMongoClient');
const IllegalShipmentStateError = require('./commands/IllegalShipmentStateError');
const loadShipment = require('./loadShipment');
const {producer} = require('../configuredKafka');

async function saveShipment(shipment) {
    const {_id} = shipment;
    await mongoClient.db('shipment')
        .collection('shipments')
        .replaceOne({_id}, shipment, {upsert: true});
}

function buildCommandFromMessage({value, timestamp}) {
    const parsedCommand = JSON.parse(value);
    const parsedTimestamp = new Date(+timestamp);
    return {
        ...parsedCommand,
        timestamp: parsedTimestamp.toISOString()
    };
}

function commandAlreadyProcessed(shipment, timestamp) {
    return shipment &&
        shipment.lastCommandTimestamp &&
        Date.parse(shipment.lastCommandTimestamp) >= timestamp;
}

async function publishEvent(event) {
    await producer.send({
        topic: 'shipment-events',
        messages: [
            { key: event.shipmentId, value: JSON.stringify(event) }
        ]
    });
}

async function saveEvent(event) {
    const _id = `${event.shipmentId}-${event.timestamp}`;
    const eventToSave = {
        ...event,
        _id
    };
    await mongoClient
        .db('shipment')
        .collection('shipment_events')
        .replaceOne(
            {_id},
            eventToSave,
            {upsert: true}
        );
}

async function eachMessage({ message }) {
    const command = buildCommandFromMessage(message);
    const loadedShipment = await loadShipment(command.shipmentId);

    if (commandAlreadyProcessed(loadedShipment, message.timestamp)) {
        return;
    }

    try {
        const updatedShipment = reducer(loadedShipment, command);
        await saveEvent(command);
        await publishEvent(command);
        await saveShipment(updatedShipment);
        console.log('updated shipment: ', updatedShipment);
    } catch (e) {
        if (e instanceof IllegalShipmentStateError) {
            console.warn('Cannot reduce event ' + e);
        } else {
            throw e;
        }
    }
}

module.exports = {
    groupId: 'process-shipment-commands',
    topic: 'shipment-commands',
    eachMessage
};