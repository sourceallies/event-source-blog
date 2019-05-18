
const {Server} = require('hapi');
const MockDate = require('mockdate');

jest.mock('../publishEvent', () => jest.fn());
const publishEvent = require('../publishEvent');

jest.mock('./createEventSchema', () => {
    return {
        _validateWithOptions: jest.fn(),
        isJoi: true
    };
});
const createEventSchema = require('./createEventSchema');

jest.mock('../../loadShipment', () => jest.fn());
const loadShipment = require('../../loadShipment');

jest.mock('./createEventReducer', () => jest.fn());

describe('Post shipment', () => {
    let server;
    let request;

    beforeEach(() => {
        createEventSchema._validateWithOptions.mockImplementation((value) => value);
        loadShipment.mockResolvedValue();

        server = new Server();
        server.route(require('./postShipment'));
        publishEvent.mockResolvedValue();

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
            expect(publishEvent).toHaveBeenCalledWith(expect.objectContaining({
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

        it('should not send the event', () => {
            expect(publishEvent).not.toHaveBeenCalled();
        });
    });
});