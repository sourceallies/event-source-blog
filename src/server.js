
require('dotenv-flow').config();

const {Server} = require('hapi');
const setupMongo = require('./setupMongo');

function logRequestEvent(_request, {tags, data}) {
    console.log(tags, data);
}

// WIP
// async function failAction(request, h, err) {
//     return h.response(err.details || err)
//         .code(400)
//         .takeover;
// }

async function init() {
    const server = new Server({
        port: process.env.PORT || 3000,
        routes: {
            cors: true,
            validate: {
                // failAction
            }
        }
    });
    server.events.on('request', logRequestEvent);
    await setupMongo(server);

    server.route(require('./root'));
    server.route(require('./shipments/events/create/postShipment'));
    server.route(require('./shipments/events/assign/assignShipment'));

    await server.start();
    console.log('Server started');
}

init()
    .catch(e => console.error(e));