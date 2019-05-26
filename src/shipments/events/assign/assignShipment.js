const assignEventSchema = require('./assignEventSchema');
const publishEvent = require('../publishEvent');
const loadShipment = require('../../loadShipment');
const assignEventReducer = require('./assignEventReducer');

function buildEventToSave({payload, params}) {
    const shipmentId = params.shipmentId;

    return {
        ...payload,
        shipmentId,
        eventType: 'assign'
    };
}

async function handler(request, h) {
    const event = buildEventToSave(request);
    const shipment = await loadShipment(event.shipmentId);
    assignEventReducer(shipment, event);

    await publishEvent(event);
    request.log(['info'], {event});
    return h.response().code(202);
}

module.exports = {
    handler,
    method: 'POST',
    path: '/shipments/{shipmentId}/events/assign',
    config: {
        validate: {
            payload: assignEventSchema
        }
    }
};