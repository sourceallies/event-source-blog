
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

jest.mock('../../loadShipment', () => jest.fn());
const loadShipment = require('../../loadShipment');

jest.mock('./calculateCost', () => jest.fn());
const calculateCost = require('./calculateCost');

jest.mock('./reducer', () => jest.fn());

describe('Submit shipment', () => {
    let server;
    let request;

    beforeEach(() => {
        schema._validateWithOptions.mockImplementation((value) => value);
        loadShipment.mockResolvedValue();

        server = new Server();
        server.route(require('./requestHandler'));
        publishCommand.mockResolvedValue();

        calculateCost.mockReturnValue(50);

        request = {
            url: '/shipments/ship1234/commands/submit',
            method: 'POST',
            payload: {
                weightInPounds: 20
            }
        };
    });

    afterEach(() => {
        MockDate.reset();
    });

    describe('A valid submit command is received', () => {
        let response;
        beforeEach(async () => {
            MockDate.set('2019-03-04T02:30:45.000Z');
            response = await server.inject(request);
        });

        it('should return accepted status', () => {
            expect(response.statusCode).toEqual(202);
        });

        it('shoudld calculate the cost', () => {
            expect(calculateCost).toHaveBeenCalledWith(request.payload);
        });

        it('should send a submit command to the shipment-commands topic', () => {
            expect(publishCommand).toHaveBeenCalledWith(expect.objectContaining({
                shipmentId: 'ship1234',
                type: 'submit',
                weightInPounds: 20
            }));
        });

        it('should set the cost', () => {
            expect(publishCommand).toHaveBeenCalledWith(expect.objectContaining({
                cost: 50
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