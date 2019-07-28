const IllegalShipmentStateError = require('../IllegalShipmentStateError');
const chance = new (require('chance').Chance)();
const reducer = require('./reducer');

describe('deliver event reducer', () => {
    let command;
    let shipment;

    beforeEach(() => {
        shipment = {
            status: 'Shipped'
        };

        command = {
            shipmentId: 'ship123',
            timestamp: '2019-02-03T10:00:00.000Z',
            type: 'deliver',
        };
    });

    describe('happy path', () => {
        let resultingShipment;
        let randomFieldName;

        beforeEach(() => {
            randomFieldName = chance.word();
            shipment[randomFieldName] = randomFieldName;
            resultingShipment = reducer(shipment, command);
        });

        it('should set the status to Delivered', () => {
            expect(resultingShipment.status).toEqual('Delivered');
        });

        it('should keep unknown fields on shipment', () => {
            expect(resultingShipment).toHaveProperty(randomFieldName, randomFieldName);
        });

        it('should set lastCommandTimestamp', () => {
            expect(resultingShipment.lastCommandTimestamp).toEqual('2019-02-03T10:00:00.000Z');
        });
    });

    describe('shipment does not exist', () => {
        it('should throw an error', () => {
            expect(() => reducer(undefined, command)).toThrow(IllegalShipmentStateError);
        });
    });

    const invalidStatuses = [
        'Created',
        'Assigned',
        'Delivered'
    ];
    describe.each(invalidStatuses)('Shipment is in %p status', (status) => {
        beforeEach(() => {
            shipment.status = status;
        });

        it('should throw an error', () => {
            expect(() => reducer(undefined, command)).toThrow(IllegalShipmentStateError);
        });
    });
});