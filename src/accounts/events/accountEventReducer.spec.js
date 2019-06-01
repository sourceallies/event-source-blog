
const accountEventReducer = require('./accountEventReducer');

describe('Account event reducer', () => {
    let event;

    beforeEach(() => {
        event = {
            accountId: 'acc123',
            eventTimestamp: '2019-02-03T10:00:00.000Z',
            amount: -10
        };
    });

    describe('Account does not exist', () => {
        let resultingAccount;

        beforeEach(() => {
            resultingAccount = accountEventReducer(undefined, event);
        });

        it('should set the _id', () => {
            expect(resultingAccount._id).toEqual('acc123');
        });

        it('should initialize the balance', () => {
            expect(resultingAccount.balance).toEqual(-10);
        });

        it('should set lastEventTimestamp', () => {
            expect(resultingAccount.lastEventTimestamp).toEqual('2019-02-03T10:00:00.000Z');
        });
    });

    describe('Account exists with a balance', () => {
        let resultingAccount;

        beforeEach(() => {
            resultingAccount = accountEventReducer({
                balance: 20
            }, event);
        });

        it('should modify the balance by the amount', () => {
            expect(resultingAccount.balance).toEqual(10);
        });

        it('should set lastEventTimestamp', () => {
            expect(resultingAccount.lastEventTimestamp).toEqual('2019-02-03T10:00:00.000Z');
        });
    });

    describe('Tombstone previous event', () => {
        let resultingAccount;

        beforeEach(() => {
            event = {
                accountId: 'acc123',
                eventTimestamp: '2019-02-03T10:00:00.000Z',
                eventType: 'tombstone',
                reversedEvent: {
                    eventTimestamp: '2019-02-02T10:00:00.000Z',
                    amount: -10
                }
            };

            resultingAccount = accountEventReducer({
                balance: 20
            }, event);
        });

        it('should reverse the balance change', () => {
            expect(resultingAccount.balance).toEqual(30);
        });

        it('should track that the event was tombstoned', () => {
            expect(resultingAccount.tombstonedEventTimestamps).toContainEqual('2019-02-02T10:00:00.000Z');
        });
    });

    describe('Duplicate tombstone previous event', () => {
        let resultingAccount;

        beforeEach(() => {
            event = {
                accountId: 'acc123',
                eventTimestamp: '2019-02-03T10:00:00.000Z',
                eventType: 'tombstone',
                reversedEvent: {
                    eventTimestamp: '2019-02-02T10:00:00.000Z',
                    amount: -10
                }
            };

            resultingAccount = accountEventReducer({
                tombstonedEventTimestamps: [
                    '2019-02-02T10:00:00.000Z'
                ],
                balance: 20
            }, event);
        });

        it('should not reverse the balance change', () => {
            expect(resultingAccount.balance).toEqual(20);
        });
    });
});