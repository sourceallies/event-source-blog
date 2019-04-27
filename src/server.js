
require('dotenv-flow').config();

const {Server} = require('hapi');
const setupMongo = require('./setupMongo');

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
    await setupMongo(server);

    server.route(require('./root'));
    server.route(require('./shipments/events/create/postShipment'));

    await server.start();
    console.log('Server started');
}

init()
    .catch(e => console.error(e));