const shippedEventSchema = require('./shippedEventSchema');

function buildEventToSave({payload, params}) {
    const shipmentId = params.shipmentId;
    const eventTimestamp = new Date(Date.now()).toISOString();

    return {
        ...payload,
        _id: `${shipmentId}-${eventTimestamp}`,
        shipmentId,
        eventTimestamp,
        eventType: 'shipped'
    };
}

async function handler(request, h) {
    const event = buildEventToSave(request);

    const {shipmentEventsCollection} = request.server.app;
    await shipmentEventsCollection.insertOne(event);

    request.log(['info'], {event});
    return h.response().code(202);
}

module.exports = {
    handler,
    method: 'POST',
    path: '/shipments/{shipmentId}/events/shipped',
    config: {
        validate: {
            payload: shippedEventSchema
        }
    }
};