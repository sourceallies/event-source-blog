
const {Server} = require('hapi');

describe('root handler', () => {
    let server;

    beforeEach(() => {
        server = new Server();
        server.route(require('./root'));
    });

    it('should return a 200', async() => {
        const response = await server.inject({url: 'http://localhost'});

        expect(response.statusCode).toEqual(200);
    });
});