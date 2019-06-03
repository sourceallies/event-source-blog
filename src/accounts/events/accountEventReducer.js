
function createAccountIfNeeded(account, event) {
    return account || {
        _id: event.accountId,
        processedEventIds: [],
        balance: 0
    };
}

module.exports = function accountEventReducer(account, event) {
    const initalizedAccount = createAccountIfNeeded(account, event);
    const {_id, amount, eventTimestamp} = event;
    return {
        ...initalizedAccount,
        lastEventTimestamp: eventTimestamp,
        balance: initalizedAccount.balance + amount,
        processedEventIds: [_id, ...initalizedAccount.processedEventIds || []]
    };
};