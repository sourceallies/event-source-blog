
const {Server} = require('hapi');
const MockDate = require('mockdate');

jest.mock('../publish', () => jest.fn());
const publishCommand = require('../publish');

jest.mock('./schema', () => {
    return {
        _validateWithOptions: jest.fn(),
        isJoi: true
    };
});
const schema = require('./schema');

describe('Payment handler', () => {
    let server;
    let request;

    beforeEach(() => {
        schema._validateWithOptions.mockImplementation((value) => value);

        server = new Server();
        server.route(require('./requestHandler'));
        publishCommand.mockResolvedValue();

        request = {
            url: '/accounts/acc123/commands/payment',
            method: 'POST',
            payload: {
                amount: 20
            }
        };
    });

    afterEach(() => {
        MockDate.reset();
    });

    describe('A valid payment command is received', () => {
        let response;
        beforeEach(async () => {
            MockDate.set('2019-03-04T02:30:45.000Z');
            response = await server.inject(request);
        });

        it('should return accepted status', () => {
            expect(response.statusCode).toEqual(202);
        });

        it('should send a payment command to the account-commands topic', () => {
            expect(publishCommand).toHaveBeenCalledWith(expect.objectContaining({
                accountId: 'acc123',
                type: 'payment',
                amount: 20
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

        it('should not send the command', () => {
            expect(publishCommand).not.toHaveBeenCalled();
        });
    });
});