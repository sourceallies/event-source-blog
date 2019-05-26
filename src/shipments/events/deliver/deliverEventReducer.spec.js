const IllegalShipmentStateError = require('../IllegalShipmentStateError');
const chance = new (require('chance').Chance)();
const deliverEventReducer = require('./deliverEventReducer');

describe('deliver event reducer', () => {
    let event;
    let shipment;

    beforeEach(() => {
        shipment = {
            status: 'Shipped'
        };

        event = {
            shipmentId: 'ship123',
            eventTimestamp: '2019-02-03T10:00:00.000Z',
            eventType: 'deliver',
        };
    });

    describe('happy path', () => {
        let resultingShipment;
        let randomFieldName;

        beforeEach(() => {
            randomFieldName = chance.word();
            shipment[randomFieldName] = randomFieldName;
            resultingShipment = deliverEventReducer(shipment, event);
        });

        it('should set the status to Delivered', () => {
            expect(resultingShipment.status).toEqual('Delivered');
        });

        it('should keep unknown fields on shipment', () => {
            expect(resultingShipment).toHaveProperty(randomFieldName, randomFieldName);
        });

        it('should set lastEventTimestamp', () => {
            expect(resultingShipment.lastEventTimestamp).toEqual('2019-02-03T10:00:00.000Z');
        });
    });

    describe('shipment does not exist', () => {
        it('should throw an error', () => {
            expect(() => deliverEventReducer(undefined, event)).toThrow(IllegalShipmentStateError);
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
            expect(() => deliverEventReducer(undefined, event)).toThrow(IllegalShipmentStateError);
        });
    });
});