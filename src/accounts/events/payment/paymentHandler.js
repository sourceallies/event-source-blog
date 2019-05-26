const paymentEventSchema = require('./paymentEventSchema');
const publishEvent = require('../publishEvent');

function buildEventToSend({payload, params}) {
    const accountId = params.accountId;

    return {
        ...payload,
        accountId,
        eventType: 'payment'
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
    path: '/accounts/{accountId}/events/payment',
    config: {
        validate: {
            payload: paymentEventSchema
        }
    }
};