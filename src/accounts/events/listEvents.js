
const mongoClient = require('../../configuredMongoClient');

async function handler(request, h) {
    const accountId = request.params.accountId;

    const events = await mongoClient
        .db('accounting')
        .collection('account_events')
        .find({accountId})
        .sort([['eventTimestamp', 1]])
        .toArray();

    return h.response(events);
}

module.exports = {
    handler,
    method: 'GET',
    path: '/accounts/{accountId}/events',
};