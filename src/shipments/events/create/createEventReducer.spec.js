
const createEventReducer = require('./createEventReducer');

describe('create event reducer', () => {
    let event;

    beforeEach(() => {
        event = {
            shipmentId: 'ship123',
            eventTimestamp: '2019-02-03T10:00:00.000Z',
            eventType: 'create',
            shipFrom: {
                name: 'Bill',
                line1: '123 Main st',
                city: 'Anywhere',
                state: 'IA',
                zip: '50123'
            },
            shipTo: {
                name: 'Acme Corp',
                line1: '455 Mulburry st',
                city: 'Anywhere',
                state: 'IA',
                zip: '50123'
            },

            weightInPounds: 10
        };
    });

    describe('happy path', () => {
        let resultingShipment;

        beforeEach(() => {
            resultingShipment = createEventReducer(null, event);
        });

        it('should set the _id to the shipmentId', () => {
            expect(resultingShipment._id).toEqual('ship123');
        });

        it('should set the status to Submitted', () => {
            expect(resultingShipment.status).toEqual('Submitted');
        });

        it('should set the createdTimestamp to the eventTimestamp', () => {
            expect(resultingShipment.createdTimestamp).toEqual('2019-02-03T10:00:00.000Z');
        });

        it('should copy over the shipFrom address', () => {
            expect(resultingShipment.shipFrom).toEqual(event.shipFrom);
        });

        it('should copy over the shipTo address', () => {
            expect(resultingShipment.shipTo).toEqual(event.shipTo);
        });

        it('should copy over the weightInPounds', () => {
            expect(resultingShipment.weightInPounds).toEqual(10);
        });
    });
});