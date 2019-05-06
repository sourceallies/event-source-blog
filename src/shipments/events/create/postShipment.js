const createEventSchema = require('./createEventSchema');
const publishEvent = require('../publishEvent');

function buildEventToSend({payload, params}) {
    const shipmentId = params.shipmentId;
    const eventTimestamp = new Date(Date.now()).toISOString();

    return {
        ...payload,
        _id: `${shipmentId}-${eventTimestamp}`,
        shipmentId,
        eventTimestamp,
        eventType: 'create'
    };
}

async function handler(request, h) {
    const event = buildEventToSend(request);
    await publishEvent(event);
    request.log(['info'], {event});
    return h.response().code(202);
}

module.exports = {
    handler,
    method: 'POST',
    path: '/shipments/{shipmentId}/events/create',
    config: {
        validate: {
            payload: createEventSchema
        }
    }
};