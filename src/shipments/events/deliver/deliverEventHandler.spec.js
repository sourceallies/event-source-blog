
const {Server} = require('hapi');

jest.mock('../publishEvent', () => jest.fn());
const publishEvent = require('../publishEvent');

jest.mock('./deliverEventSchema', () => {
    return {
        _validateWithOptions: jest.fn(),
        isJoi: true
    };
});
const deliverEventSchema = require('./deliverEventSchema');

jest.mock('../../loadShipment', () => jest.fn());
const loadShipment = require('../../loadShipment');

jest.mock('./deliverEventReducer', () => jest.fn());

describe('Deliver shipment', () => {
    let server;
    let request;

    beforeEach(() => {
        deliverEventSchema._validateWithOptions.mockImplementation((value) => value);
        loadShipment.mockResolvedValue({});

        server = new Server();
        server.route(require('./deliverEventHandler'));
        publishEvent.mockResolvedValue();

        request = {
            url: '/shipments/ship1234/events/deliver',
            method: 'POST',
            payload: {
            }
        };
    });

    describe('A valid deliver event is received', () => {
        let response;
        beforeEach(async () => {
            response = await server.inject(request);
        });

        it('should return accepted status', () => {
            expect(response.statusCode).toEqual(202);
        });

        it('should send a deliver event to the shipment-events topic', () => {
            expect(publishEvent).toHaveBeenCalledWith(expect.objectContaining({
                shipmentId: 'ship1234',
                eventType: 'deliver'
            }));
        });
    });

    describe('An invalid event is received', () => {
        let response;
        beforeEach(async () => {
            deliverEventSchema._validateWithOptions.mockImplementation(() => {
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