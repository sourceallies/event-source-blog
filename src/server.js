
require('dotenv-flow').config();

const {Server} = require('hapi');
const setupMongo = require('./setupMongo');

async function init() {
    const server = new Server({
        port: process.env.PORT || 3000
    });
    server.app.mongoClient = await setupMongo();

    server.route(require('./root'));

    await server.start();
    console.log('Server started');
}

init()
    .catch(e => console.error(e));