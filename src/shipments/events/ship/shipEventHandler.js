const shipEventSchema = require('./shipEventSchema');
const publishEvent = require('../publishEvent');
const loadShipment = require('../../loadShipment');
const shippedEventReducer = require('./shipEventReducer');
const shortid = require('shortid');

function buildEventToSave({payload, params}) {
    const shipmentId = params.shipmentId;

    return {
        ...payload,
        _id: shortid.generate(),
        shipmentId,
        eventType: 'ship'
    };
}

async function handler(request, h) {
    const event = buildEventToSave(request);
    const shipment = await loadShipment(event.shipmentId);
    shippedEventReducer(shipment, event);
    await publishEvent(event);
    request.log(['info'], {event});
    return h.response().code(202);
}

module.exports = {
    handler,
    method: 'POST',
    path: '/shipments/{shipmentId}/events/ship',
    config: {
        validate: {
            payload: shipEventSchema
        }
    }
};