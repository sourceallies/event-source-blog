const submitEventSchema = require('./submitEventSchema');
const publishEvent = require('../publishEvent');
const loadShipment = require('../../loadShipment');
const submitEventReducer = require('./submitEventReducer');
const calculateCost = require('./calculateCost');

function buildEventToSend({payload, params}) {
    const shipmentId = params.shipmentId;

    return {
        ...payload,
        shipmentId,
        eventType: 'submit',
        cost: calculateCost(payload)
    };
}

async function handler(request, h) {
    const event = buildEventToSend(request);
    const shipment = await loadShipment(event.shipmentId);
    submitEventReducer(shipment, event);

    await publishEvent(event);
    request.log(['info'], {event});
    return h.response().code(202);
}

module.exports = {
    handler,
    method: 'POST',
    path: '/shipments/{shipmentId}/events/submit',
    config: {
        validate: {
            payload: submitEventSchema
        }
    }
};