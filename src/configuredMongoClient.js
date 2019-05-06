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

function onConnect(...args) {
    console.log('connected: ', args);
}

client.on('connected', onConnect);

module.exports = client;