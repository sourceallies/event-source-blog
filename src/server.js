
require('dotenv-flow').config();

const {Server} = require('hapi');
const mongoClient = require('./configuredMongoClient');
const configuredKafka = require('./configuredKafka');
const setupEventListener = require('./setupEventListener');

function logRequestEvent(_request, {tags, data, error}) {
    console.log(tags, data, error);
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
    await mongoClient.configureIndexes();

    await configuredKafka.producer.connect();
    await Promise.all([
        require('./accounts/processCommandListener'),
        require('./accounts/updateAccountEventHandler'),
        require('./accounts/invoiceAccountOnShipmentDelivery'),
        require('./shipments/processCommandListener')
    ].map(setupEventListener));

    server.route(require('./root'));

    server.route(require('./accounts/getAccountHandler'));
    server.route(require('./accounts/listAccountsHandler'));
    server.route(require('./accounts/commands/payment/requestHandler'));
    server.route(require('./accounts/events/listEvents'));
    server.route(require('./shipments/listShipments'));
    server.route(require('./shipments/getShipmentById'));
    server.route(require('./shipments/commands/submit/requestHandler'));
    server.route(require('./shipments/commands/assign/requestHandler'));
    server.route(require('./shipments/commands/ship/requestHandler'));
    server.route(require('./shipments/commands/deliver/requestHandler'));
    server.route(require('./shipments/events/listEvents'));

    await server.start();
    console.log('Server started');
}

init()
    .catch(e => {
        console.error(e);
        // process.exit(1);
    });