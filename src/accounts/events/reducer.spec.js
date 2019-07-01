
const reducer = require('./reducer');

describe('Account event reducer', () => {
    let event;

    beforeEach(() => {
        event = {
            accountId: 'acc123',
            timestamp: '2019-02-03T10:00:00.000Z',
            amount: -10
        };
    });

    describe('Account does not exist', () => {
        let resultingAccount;

        beforeEach(() => {
            resultingAccount = reducer(undefined, event);
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
            resultingAccount = reducer({
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
});