
const {MongoClient} = require('mongodb');

function getMongoURL() {
    const url = process.env.MONGO_URL;
    if (!url) {
        throw new Error('No MONGO_URL set');
    }
    return url;
}

async function createShipmentEventIndexes(mongoClient) {
    const collection = mongoClient
        .db('shipment')
        .collection('shipment_events');

    await collection.createIndex('shipmentId');
}

module.exports = async function setupMongo() {
    const client = await MongoClient.connect(getMongoURL(), {
        useNewUrlParser: true
    });

    await createShipmentEventIndexes(client);
    return client;
};