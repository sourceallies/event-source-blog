
const reducer = require('./commands/reducer');
const mongoClient = require('../configuredMongoClient');
const IllegalShipmentStateError = require('./commands/IllegalShipmentStateError');
const publishEvent = require('./events/publish');
const loadShipment = require('./loadShipment');
const saveEvent = require('./events/save');

async function saveShipment(shipment) {
    const {_id} = shipment;
    await mongoClient.db('shipment')
        .collection('shipments')
        .replaceOne({_id}, shipment, {upsert: true});
}

function getCommandFromMessage({value, timestamp}) {
    const parsedTimestamp = new Date(+timestamp);
    return {
        ...JSON.parse(value),
        timestamp: parsedTimestamp.toISOString()
    };
}

function commandAlreadyProcessed(shipment, timestamp) {
    return shipment &&
        shipment.lastCommandTimestamp &&
        Date.parse(shipment.lastCommandTimestamp) >= timestamp;
}

async function eachMessage({ message }) {
    const command = getCommandFromMessage(message);
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
    groupId: 'process-commands',
    topic: 'shipment-commands',
    eachMessage
};