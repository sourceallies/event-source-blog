const {MongoClient} = require('mongodb');

function getMongoURL() {
    const url = process.env.MONGO_URL;
    if (!url) {
        throw new Error('No MONGO_URL set');
    }
    return url;
}

const client = new MongoClient(getMongoURL(), {
    useNewUrlParser: true
});

async function configureShipmentIndexes() {
    await client
        .db('shipment')
        .collection('shipment_events')
        .createIndex('shipmentId');
}

async function configureAccountIndexes() {
    await client
        .db('accounting')
        .collection('account_events')
        .createIndex('accountId');
}

client.configureIndexes = async function configureIndexes() {
    await Promise.all([
        configureAccountIndexes(),
        configureShipmentIndexes()
    ]);
};

module.exports = client;