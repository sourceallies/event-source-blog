
function getNewBalance(account, amount) {
    const currentBalance = account ? account.balance : 0;
    return currentBalance + amount;
}

module.exports = function accountEventReducer(account, event) {
    const {amount, accountId, eventTimestamp} = event;
    return {
        ...account,
        _id: accountId,
        lastEventTimestamp: eventTimestamp,
        balance: getNewBalance(account, amount)
    };
};