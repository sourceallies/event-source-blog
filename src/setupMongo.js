
const {MongoClient} = require('mongodb');

function getMongoURL() {
    const url = process.env.MONGO_URL;
    if (!url) {
        throw new Error('No MONGO_URL set');
    }
    return url;
}

module.exports = async function setupMongo() {
    const client = await MongoClient.connect(getMongoURL(), {
        useNewUrlParser: true
    });

    return client;
};