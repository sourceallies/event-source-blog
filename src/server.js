
require('dotenv-flow').config();

const {Server} = require('hapi');
const setupMongo = require('./setupMongo');

function logRequestEvent(_request, {tags, data}) {
    console.log(tags, data);
}

async function init() {
    const server = new Server({
        port: process.env.PORT || 3000
    });
    server.events.on('request', logRequestEvent);
    server.app.mongoClient = await setupMongo();

    server.route(require('./root'));
    server.route(require('./shipments/events/create-shipment/postShipment'));

    await server.start();
    console.log('Server started');
}

init()
    .catch(e => console.error(e));