const deliverEventSchema = require('./deliverEventSchema');
const publishEvent = require('../publishEvent');
const loadShipment = require('../../loadShipment');
const deliverEventReducer = require('./deliverEventReducer');

function buildEventToSave({payload, params}) {
    const shipmentId = params.shipmentId;
    const eventTimestamp = new Date(Date.now()).toISOString();

    return {
        ...payload,
        _id: `${shipmentId}-${eventTimestamp}`,
        shipmentId,
        eventTimestamp,
        eventType: 'deliver'
    };
}

async function handler(request, h) {
    const event = buildEventToSave(request);
    const shipment = await loadShipment(event.shipmentId);
    deliverEventReducer(shipment, event);

    await publishEvent(event);
    request.log(['info'], {event});
    return h.response().code(202);
}

module.exports = {
    method: 'POST',
    path: '/shipments/{shipmentId}/events/deliver',
    handler,
    config: {
        validate: {
            payload: deliverEventSchema
        }
    }
};