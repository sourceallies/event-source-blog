
const {Server} = require('hapi');
const MockDate = require('mockdate');

jest.mock('../publishEvent', () => jest.fn());
const publishEvent = require('../publishEvent');

jest.mock('./paymentEventSchema', () => {
    return {
        _validateWithOptions: jest.fn(),
        isJoi: true
    };
});
const paymentEventSchema = require('./paymentEventSchema');

describe('Payment event handler', () => {
    let server;
    let request;

    beforeEach(() => {
        paymentEventSchema._validateWithOptions.mockImplementation((value) => value);

        server = new Server();
        server.route(require('./paymentHandler'));
        publishEvent.mockResolvedValue();

        request = {
            url: '/accounts/acc123/events/payment',
            method: 'POST',
            payload: {
                amount: 20
            }
        };
    });

    afterEach(() => {
        MockDate.reset();
    });

    describe('A valid payment event is received', () => {
        let response;
        beforeEach(async () => {
            MockDate.set('2019-03-04T02:30:45.000Z');
            response = await server.inject(request);
        });

        it('should return accepted status', () => {
            expect(response.statusCode).toEqual(202);
        });

        it('should send a payment event to the account-events topic', () => {
            expect(publishEvent).toHaveBeenCalledWith(expect.objectContaining({
                accountId: 'acc123',
                eventType: 'payment',
                amount: 20
            }));
        });
    });

    describe('An invalid event is received', () => {
        let response;
        beforeEach(async () => {
            paymentEventSchema._validateWithOptions.mockImplementation(() => {
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