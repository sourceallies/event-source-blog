const schema = require('./schema');
const publish = require('../publish');
const loadShipment = require('../../loadShipment');
const reducer = require('./reducer');

function buildCommandToSave({payload, params}) {
    const shipmentId = params.shipmentId;

    return {
        ...payload,
        shipmentId,
        type: 'deliver'
    };
}

async function handler(request, h) {
    const command = buildCommandToSave(request);
    const shipment = await loadShipment(command.shipmentId);
    reducer(shipment, command);

    await publish(command);
    request.log(['info'], {event: command});
    return h.response().code(202);
}

module.exports = {
    method: 'POST',
    path: '/shipments/{shipmentId}/commands/deliver',
    handler,
    config: {
        validate: {
            payload: schema
        }
    }
};