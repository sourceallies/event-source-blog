
const {MongoClient} = require('mongodb');

function getMongoURL() {
    const url = process.env.MONGO_URL;
    if (!url) {
        throw new Error('No MONGO_URL set');
    }
    return url;
}

async function setupShipmentEventsCollection(mongoClient) {
    const collection = mongoClient
        .db('shipment')
        .collection('shipment_events');

    await collection.createIndex('shipmentId');

    const changeStream = collection.watch([], {fullDocument: 'updateLookup'});
    changeStream.on('change', require('./shipments/events/onChange'));
    return collection;
}

module.exports = async function setupMongo(server) {
    const client = await MongoClient.connect(getMongoURL(), {
        useNewUrlParser: true
    });

    server.app.mongoClient = client;
    server.app.shipmentEventsCollection = await setupShipmentEventsCollection(client);
    return client;
};