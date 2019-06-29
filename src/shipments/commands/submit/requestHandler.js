const submitCommandSchema = require('./schema');
const publishCommand = require('../publish');
const loadShipment = require('../../loadShipment');
const reducer = require('./reducer');
const calculateCost = require('./calculateCost');

function buildCommandToSend({payload, params}) {
    const shipmentId = params.shipmentId;

    return {
        ...payload,
        shipmentId,
        type: 'submit',
        cost: calculateCost(payload)
    };
}

async function handler(request, h) {
    const command = buildCommandToSend(request);
    const shipment = await loadShipment(command.shipmentId);
    reducer(shipment, command);

    await publishCommand(command);
    return h.response().code(202);
}

module.exports = {
    handler,
    method: 'POST',
    path: '/shipments/{shipmentId}/commands/submit',
    config: {
        validate: {
            payload: submitCommandSchema
        }
    }
};