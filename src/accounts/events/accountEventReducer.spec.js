
const accountEventReducer = require('./accountEventReducer');

describe('Account event reducer', () => {
    let event;

    beforeEach(() => {
        event = {
            _id: 'ev123',
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

        it('should initialize the processedEventIds array', () => {
            expect(resultingAccount.processedEventIds).toEqual(['ev123']);
        });
    });

    describe('Account exists with a balance', () => {
        let resultingAccount;

        beforeEach(() => {
            resultingAccount = accountEventReducer({
                processedEventIds: ['ev000'],
                balance: 20
            }, event);
        });

        it('should modify the balance by the amount', () => {
            expect(resultingAccount.balance).toEqual(10);
        });

        it('should set lastEventTimestamp', () => {
            expect(resultingAccount.lastEventTimestamp).toEqual('2019-02-03T10:00:00.000Z');
        });

        it('should append the processedEventIds array', () => {
            expect(resultingAccount.processedEventIds).toEqual(['ev123', 'ev000']);
        });
    });
});