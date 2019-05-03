
const {Server} = require('hapi');
const MockDate = require('mockdate');
const mockProducer = {
    send: jest.fn()
};
jest.mock('./createEventSchema', () => {
    return {
        _validateWithOptions: jest.fn(),
        isJoi: true
    };
});
const createEventSchema = require('./createEventSchema');

describe('Post shipment', () => {
    let server;
    let request;

    beforeEach(() => {
        createEventSchema._validateWithOptions.mockImplementation((value) => value);

        server = new Server();
        server.route(require('./postShipment'));
        mockProducer.send.mockResolvedValue();
        server.app.producer = mockProducer;

        request = {
            url: '/shipments/ship1234/events/create',
            method: 'POST',
            payload: {
                weightInPounds: 20
            }
        };
    });

    afterEach(() => {
        MockDate.reset();
    });

    describe('A valid create event is received', () => {
        let response;
        beforeEach(async () => {
            MockDate.set('2019-03-04T02:30:45.000Z');
            response = await server.inject(request);
        });

        it('should return accepted status', () => {
            expect(response.statusCode).toEqual(202);
        });

        it('should send a create event to the shipment-events topic', () => {
            const body = JSON.parse(mockProducer.send.mock.calls[0][0].messages[0].value);
            expect(body).toEqual(expect.objectContaining({
                _id: 'ship1234-2019-03-04T02:30:45.000Z',
                shipmentId: 'ship1234',
                eventTimestamp: '2019-03-04T02:30:45.000Z',
                eventType: 'create',
                weightInPounds: 20
            }));
        });

        it('should send the event to the shipment-events topic', () => {
            expect(mockProducer.send).toHaveBeenCalledWith(expect.objectContaining({
                topic: 'shipment-events'
            }));
        });

        it('should partition the message by shipmentId', () => {
            const key = mockProducer.send.mock.calls[0][0].messages[0].key;
            expect(key).toEqual('ship1234');
        });
    });

    describe('An invalid event is received', () => {
        let response;
        beforeEach(async () => {
            createEventSchema._validateWithOptions.mockImplementation(() => {
                throw new Error();
            });
            response = await server.inject(request);
        });

        it('should return a bad request status', () => {
            expect(response.statusCode).toEqual(400);
        });

        it('should not send the event', () => {
            expect(mockProducer.send).not.toHaveBeenCalled();
        });
    });
});