
jest.mock('./commands/reducer', () => jest.fn());
const reducer = require('./commands/reducer');

jest.mock('../configuredMongoClient', () => {
    const {MongoClient} = require('mongodb');
    const client = new MongoClient(global.__MONGO_URI__, {useNewUrlParser: true});
    return client;
});
const mongoClient = require('../configuredMongoClient');

jest.mock('../configuredKafka', () => {
    return {
        producer: {
            send: jest.fn()
        }
    };
});
const {producer} = require('../configuredKafka');

const IllegalShipmentStateError = require('./commands/IllegalShipmentStateError');

const processCommandListener = require('./processCommandListener');

describe('Process Shipment command listener', () => {
    let eventsCollection;
    let shipmentsCollection;
    let reducedShipment;

    beforeAll(async () => {
        await mongoClient.connect();
        shipmentsCollection = mongoClient
            .db('shipment')
            .collection('shipments');
        eventsCollection = mongoClient
            .db('shipment')
            .collection('shipment_events');
    });

    afterAll(async () => {
        await mongoClient.close();
    });

    beforeEach(async () => {
        await shipmentsCollection.deleteMany({});
        await eventsCollection.deleteMany({});

        reducedShipment = {
            _id: 'ship123'
        };
        reducer.mockReturnValue(reducedShipment);
        producer.send.mockResolvedValue();
    });

    describe('an initial event is received', () => {
        let message;
        let command;

        beforeEach(async () => {
            command = {
                shipmentId: 'ship123',
                type: 'submit'
            };
            message = {
                value: JSON.stringify(command),
                timestamp: 1561860112016
            };

            await processCommandListener.eachMessage({message});
        });

        it('should reduce the command', () => {
            const expectedCommand = {
                ...command,
                timestamp: '2019-06-30T02:01:52.016Z'
            };
            expect(reducer).toHaveBeenCalledWith(null, expectedCommand);
        });

        it('should save the command as an event', async () => {
            const savedEvent = await eventsCollection.findOne({_id: 'ship123-2019-06-30T02:01:52.016Z'});
            expect(savedEvent).toEqual(expect.objectContaining({
                ...command,
                timestamp: '2019-06-30T02:01:52.016Z'
            }));
        });

        it('should save the shipment', async () => {
            const savedShipment = await shipmentsCollection.findOne({_id: 'ship123'});
            expect(savedShipment).toEqual(reducedShipment);
        });

        it('should publish an event', () => {
            expect(producer.send).toHaveBeenCalledWith({
                topic: 'shipment-events',
                messages: [
                    { key: 'ship123', value: expect.anything() }
                ]
            });
        });
    });

    describe('the shipment currently exists', () => {
        let message;
        let command;
        let existingShipment;

        beforeEach(async () => {
            command = {
                shipmentId: 'ship123',
                type: 'assign'
            };
            message = {
                value: JSON.stringify(command),
                timestamp: 1561860112016
            };

            existingShipment = {
                _id: 'ship123'
            };

            await shipmentsCollection.insertOne(existingShipment);

            await processCommandListener.eachMessage({message});
        });

        it('should reduce the existing shipment and command', () => {
            const expectedCommand = {
                ...command,
                timestamp: '2019-06-30T02:01:52.016Z'
            };
            expect(reducer).toHaveBeenCalledWith(existingShipment, expectedCommand);
        });

        it('should save the command as an event', async () => {
            const savedEvent = await eventsCollection.findOne({_id: 'ship123-2019-06-30T02:01:52.016Z'});
            expect(savedEvent).toEqual(expect.objectContaining({
                ...command,
                timestamp: '2019-06-30T02:01:52.016Z'
            }));
        });

        it('should save the shipment', async () => {
            const savedShipment = await shipmentsCollection.findOne({_id: 'ship123'});
            expect(savedShipment).toEqual(reducedShipment);
        });

        it('should publish an event', () => {
            expect(producer.send).toHaveBeenCalledWith({
                topic: 'shipment-events',
                messages: [
                    { key: 'ship123', value: expect.anything() }
                ]
            });
        });
    });

    describe('The shipment fails to reduce because the state of the shipment is incompatable', () => {
        let message;
        let command;

        beforeEach(async () => {
            command = {
                shipmentId: 'ship123',
                type: 'deliver'
            };
            message = {
                value: JSON.stringify(command),
                timestamp: 1561860112016
            };

            reducer.mockImplementation(() => {
                throw new IllegalShipmentStateError();
            });

            await processCommandListener.eachMessage({message});
        });

        it('should not save the command as an event', async () => {
            const events = await eventsCollection.find().toArray();

            expect(events).toHaveLength(0);
        });

        it('should not save the shipment', async () => {
            const shipments = await shipmentsCollection.find().toArray();

            expect(shipments).toHaveLength(0);
        });

        it('should not publish an event', () => {
            expect(producer.send).not.toHaveBeenCalled();
        });
    });
});