
function createAccountIfNeeded(account, event) {
    return account || {
        _id: event.accountId,
        tombstonedEventTimestamps: [],
        balance: 0
    };
}

function reduceTransactionEvent(account, event) {
    const initalizedAccount = createAccountIfNeeded(account, event);
    const {amount, eventTimestamp} = event;
    return {
        ...initalizedAccount,
        lastEventTimestamp: eventTimestamp,
        balance: initalizedAccount.balance + amount
    };
}

function reduceTombstoneEvent(account, event) {
    const initalizedAccount = createAccountIfNeeded(account, event);
    const tombstonedEventTimestamps = initalizedAccount.tombstonedEventTimestamps || [];
    const {eventTimestamp, reversedEvent} = event;
    if (tombstonedEventTimestamps.includes(reversedEvent.eventTimestamp)) {
        return {
            ...initalizedAccount,
            lastEventTimestamp: eventTimestamp
        };
    }

    return {
        ...initalizedAccount,
        lastEventTimestamp: eventTimestamp,
        balance: initalizedAccount.balance - reversedEvent.amount,
        tombstonedEventTimestamps: [reversedEvent.eventTimestamp, ...tombstonedEventTimestamps]
    };
}

module.exports = function accountEventReducer(account, event) {
    if (event.eventType === 'tombstone') {
        return reduceTombstoneEvent(account, event);
    }
    return reduceTransactionEvent(account, event);
};