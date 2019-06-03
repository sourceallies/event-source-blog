const accountEventReducer = require('./events/accountEventReducer');
const mongoClient = require('../configuredMongoClient');
const getAccountById = require('./getAccountById');

async function saveAccount(account) {
    const {_id} = account;
    await mongoClient.db('accounting')
        .collection('accounts')
        .replaceOne({_id}, account, {upsert: true});
}

function getEventFromMessage({value, timestamp}) {
    const eventTimestamp = new Date(+timestamp).toISOString();
    return {
        ...JSON.parse(value),
        eventTimestamp
    };
}

function eventAlreadyProcessed(account, event) {
    const {_id} = event;
    return account &&
        account.processedEventIds &&
        account.processedEventIds.includes(_id);
}

async function eachMessage({ message }) {
    const event = getEventFromMessage(message);

    const loadedAccount = await getAccountById(event.accountId);
    if (eventAlreadyProcessed(loadedAccount, event)) {
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