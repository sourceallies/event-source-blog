const deliverEventSchema = require('./deliverEventSchema');
const publishEvent = require('../publishEvent');
const loadShipment = require('../../loadShipment');
const deliverEventReducer = require('./deliverEventReducer');
const shortid = require('shortid');

function buildEventToSave({payload, params}) {
    const shipmentId = params.shipmentId;

    return {
        ...payload,
        _id: shortid.generate(),
        shipmentId,
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