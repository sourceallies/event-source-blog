
const IllegalShipmentStateError = require('../IllegalShipmentStateError');
const assignEventReducer = require('./assignEventReducer');

describe('assign event reducer', () => {
    let event;
    let shipment;

    beforeEach(() => {
        event = {
            shipmentId: 'ship123',
            eventTimestamp: '2019-02-03T10:00:00.000Z',
            eventType: 'assign',
            truckId: '56'
        };
        shipment = {
            _id: 'ship123',
            status: 'Submitted'
        };
    });

    describe.each(['Submitted', 'Assigned'])('shipment is in %p status', (status) => {
        let resultingShipment;

        beforeEach(() => {
            shipment.status = status;
            resultingShipment = assignEventReducer(shipment, event);
        });

        it('should set the status to Assigned', () => {
            expect(resultingShipment.status).toEqual('Assigned');
        });

        it('should set assignedToTruck to the truckId ', () => {
            expect(resultingShipment.assignedToTruck).toEqual('56');
        });

        it('should set lastEventTimestamp', () => {
            expect(resultingShipment.lastEventTimestamp).toEqual('2019-02-03T10:00:00.000Z');
        });
    });

    describe('shipment does not exist', () => {
        it('should throw an error', () => {
            expect(() => assignEventReducer(undefined, event)).toThrow(IllegalShipmentStateError);
        });
    });

    describe('shipment has already been shipped', () => {
        beforeEach(() => {
            shipment.status = 'Shipped';
        });

        it('should throw an error', () => {
            expect(() => assignEventReducer(shipment, event)).toThrow(IllegalShipmentStateError);
        });
    });
});