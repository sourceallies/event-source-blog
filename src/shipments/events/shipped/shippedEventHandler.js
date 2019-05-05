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

    await request.server.app.producer.send({
        topic: 'shipment-events',
        messages: [
            { key: event.shipmentId, value: JSON.stringify(event) }
        ]
    });

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