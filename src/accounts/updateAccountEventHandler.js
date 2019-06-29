const accountEventReducer = require('./events/reducer');
const mongoClient = require('../configuredMongoClient');
const getAccountById = require('./getAccountById');

async function saveAccount(account) {
    const {_id} = account;
    await mongoClient.db('accounting')
        .collection('accounts')
        .replaceOne({_id}, account, {upsert: true});
}

function eventAlreadyProcessed(account, timestamp) {
    return account &&
        account.lastEventTimestamp &&
        Date.parse(account.lastEventTimestamp) >= timestamp;
}

async function eachMessage({ message }) {
    const event = JSON.parse(message.value);

    const loadedAccount = await getAccountById(event.accountId);
    if (eventAlreadyProcessed(loadedAccount, message.timestamp)) {
        return;
    }
    const updatedAccount = accountEventReducer(loadedAccount, event);
    await saveAccount(updatedAccount);
    console.log('updated account: ', updatedAccount);
}

module.exports = {
    groupId: 'update-account',
    topic: 'account-events',
    eachMessage
};