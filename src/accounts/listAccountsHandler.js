const mongoClient = require('../configuredMongoClient');

async function getAccounts() {
    return await mongoClient
        .db('accounting')
        .collection('accounts')
        .find()
        .toArray();
}

async function handler(request, h) {
    const shipments = await getAccounts();
    return h.response(shipments);
}

module.exports = {
    handler,
    method: 'GET',
    path: '/accounts',
};