
function createAccountIfNeeded(account, event) {
    return account || {
        _id: event.accountId,
        balance: 0
    };
}

module.exports = function accountEventReducer(account, event) {
    const initalizedAccount = createAccountIfNeeded(account, event);
    const {amount, timestamp} = event;
    return {
        ...initalizedAccount,
        lastEventTimestamp: timestamp,
        balance: initalizedAccount.balance + amount
    };
};