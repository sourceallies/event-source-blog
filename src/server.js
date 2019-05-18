
require('dotenv-flow').config();

const {Server} = require('hapi');
const mongoClient = require('./configuredMongoClient');
const configuredKafka = require('./configuredKafka');

function logRequestEvent(_request, {tags, data}) {
    console.log(tags, data);
}

async function failAction(request, h, err) {
    err.output.payload = err.details
        .map(({path, message}) => ({path, message}));
    throw err;
}

async function init() {
    const server = new Server({
        port: process.env.PORT || 3000,
        routes: {
            cors: true,
            validate: {
                failAction
            }
        }
    });
    server.events.on('request', logRequestEvent);
    await mongoClient.connect();
    //TODO: move somewhere
    await mongoClient
        .db('shipment')
        .collection('shipment_events')
        .createIndex('shipmentId');

    await configuredKafka.producer.connect();
    await require('./shipments/events/setupSaveEventListener')();
    await require('./shipments/setupShipmentEventListener')();

    server.route(require('./root'));
    server.route(require('./shipments/listShipments'));
    server.route(require('./shipments/getShipmentById'));
    server.route(require('./shipments/events/listEvents'));
    server.route(require('./shipments/events/create/postShipment'));
    server.route(require('./shipments/events/assign/assignShipment'));
    server.route(require('./shipments/events/shipped/shippedEventHandler'));

    await server.start();
    console.log('Server started');
}

init()
    .catch(e => {
        console.error(e);
        process.exit(1);
    });