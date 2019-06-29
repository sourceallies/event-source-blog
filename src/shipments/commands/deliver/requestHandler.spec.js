
const {Server} = require('hapi');

jest.mock('../publish', () => jest.fn());
const publish = require('../publish');

jest.mock('./schema', () => {
    return {
        _validateWithOptions: jest.fn(),
        isJoi: true
    };
});
const schema = require('./schema');

jest.mock('../../loadShipment', () => jest.fn());
const loadShipment = require('../../loadShipment');

jest.mock('./reducer', () => jest.fn());

describe('Deliver shipment', () => {
    let server;
    let request;

    beforeEach(() => {
        schema._validateWithOptions.mockImplementation((value) => value);
        loadShipment.mockResolvedValue({});

        server = new Server();
        server.route(require('./requestHandler'));
        publish.mockResolvedValue();

        request = {
            url: '/shipments/ship1234/commands/deliver',
            method: 'POST',
            payload: {
            }
        };
    });

    describe('A valid deliver command is received', () => {
        let response;
        beforeEach(async () => {
            response = await server.inject(request);
        });

        it('should return accepted status', () => {
            expect(response.statusCode).toEqual(202);
        });

        it('should send a deliver command to the shipment-commands topic', () => {
            expect(publish).toHaveBeenCalledWith(expect.objectContaining({
                shipmentId: 'ship1234',
                type: 'deliver'
            }));
        });
    });

    describe('An invalid command is received', () => {
        let response;
        beforeEach(async () => {
            schema._validateWithOptions.mockImplementation(() => {
                throw new Error();
            });
            response = await server.inject(request);
        });

        it('should return a bad request status', () => {
            expect(response.statusCode).toEqual(400);
        });

        it('should not send the event', () => {
            expect(publish).not.toHaveBeenCalled();
        });
    });
});