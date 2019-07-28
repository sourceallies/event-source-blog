
const IllegalShipmentStateError = require('../IllegalShipmentStateError');
const reducer = require('./reducer');

describe('assign reducer', () => {
    let command;
    let shipment;

    beforeEach(() => {
        command = {
            shipmentId: 'ship123',
            timestamp: '2019-02-03T10:00:00.000Z',
            types: 'assign',
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
            resultingShipment = reducer(shipment, command);
        });

        it('should set the status to Assigned', () => {
            expect(resultingShipment.status).toEqual('Assigned');
        });

        it('should set assignedToTruck to the truckId ', () => {
            expect(resultingShipment.assignedToTruck).toEqual('56');
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

    describe('shipment has already been shipped', () => {
        beforeEach(() => {
            shipment.status = 'Shipped';
        });

        it('should throw an error', () => {
            expect(() => reducer(shipment, command)).toThrow(IllegalShipmentStateError);
        });
    });
});