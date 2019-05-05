
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

    describe('happy path', () => {
        let resultingShipment;

        beforeEach(() => {
            resultingShipment = assignEventReducer(shipment, event);
        });

        it('should set the status to Assigned', () => {
            expect(resultingShipment.status).toEqual('Assigned');
        });

        it('should set assignedToTruck to the truckId ', () => {
            expect(resultingShipment.assignedToTruck).toEqual('56');
        });
    });
});