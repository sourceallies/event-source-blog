
const {Server} = require('hapi');

async function init() {
    const server = new Server({
        port: process.env.PORT || 3000
    });

    server.route(require('./root'));

    await server.start();
    console.log('Server started')
}

init()
    .catch(e => console.error(e));