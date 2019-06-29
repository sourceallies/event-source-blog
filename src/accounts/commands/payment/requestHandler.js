const schema = require('./schema');
const publish = require('../publish');
const shortId = require('shortid');

function buildCommandToSend({payload, params}) {
    const accountId = params.accountId;

    return {
        ...payload,
        _id: `payments:${shortId.generate()}`,
        accountId,
        type: 'payment'
    };
}

async function handler(request, h) {
    const command = buildCommandToSend(request);
    await publish(command);
    request.log(['info'], {event: command});
    return h.response().code(202);
}

module.exports = {
    handler,
    method: 'POST',
    path: '/accounts/{accountId}/commands/payment',
    config: {
        validate: {
            payload: schema
        }
    }
};