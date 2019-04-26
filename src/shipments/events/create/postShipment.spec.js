
const {Server} = require('hapi');
const MockDate = require('mockdate');
const mockShipmentEventsCollection = {
    insertOne: jest.fn()
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
        mockShipmentEventsCollection.insertOne.mockResolvedValue();
        server.app.shipmentEventsCollection = mockShipmentEventsCollection;

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

        it('should save a create event', () => {
            expect(mockShipmentEventsCollection.insertOne).toHaveBeenCalledWith(expect.objectContaining({
                _id: 'ship1234-2019-03-04T02:30:45.000Z',
                shipmentId: 'ship1234',
                eventTimestamp: '2019-03-04T02:30:45.000Z',
                eventType: 'create',
                weightInPounds: 20
            }));
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

        it('should not save the event', () => {
            expect(mockShipmentEventsCollection.insertOne).not.toHaveBeenCalled();
        });
    });
});