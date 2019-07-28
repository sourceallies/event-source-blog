
const IllegalShipmentStateError = require('../IllegalShipmentStateError');
const reducer = require('./reducer');

describe('submit reducer', () => {
    let command;

    beforeEach(() => {
        command = {
            shipmentId: 'ship123',
            timestamp: '2019-02-03T10:00:00.000Z',
            type: 'submit',
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

            weightInPounds: 10,
            billToAccountId: 'acc123',
            cost: 100
        };
    });

    describe('happy path', () => {
        let resultingShipment;

        beforeEach(() => {
            resultingShipment = reducer(null, command);
        });

        it('should set the _id to the shipmentId', () => {
            expect(resultingShipment._id).toEqual('ship123');
        });

        it('should set the status to Submitted', () => {
            expect(resultingShipment.status).toEqual('Submitted');
        });

        it('should set the createdTimestamp to the timestamp', () => {
            expect(resultingShipment.createdTimestamp).toEqual('2019-02-03T10:00:00.000Z');
        });

        it('should copy over the shipFrom address', () => {
            expect(resultingShipment.shipFrom).toEqual(command.shipFrom);
        });

        it('should copy over the shipTo address', () => {
            expect(resultingShipment.shipTo).toEqual(command.shipTo);
        });

        it('should copy over the weightInPounds', () => {
            expect(resultingShipment.weightInPounds).toEqual(10);
        });

        it('should copy over cost', () => {
            expect(resultingShipment.cost).toEqual(100);
        });

        it('should copy over billToAccountId', () => {
            expect(resultingShipment.billToAccountId).toEqual('acc123');
        });

        it('should set lastCommandTimestamp', () => {
            expect(resultingShipment.lastCommandTimestamp).toEqual('2019-02-03T10:00:00.000Z');
        });
    });

    describe('shipment already exists', () => {
        it('should throw an error', () => {
            expect(() => reducer({}, command)).toThrow(IllegalShipmentStateError);
        });
    });
});