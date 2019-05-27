const mongoClient = require('../configuredMongoClient');

module.exports = async function getAccountById(_id) {
    return await mongoClient
        .db('accounting')
        .collection('accounts')
        .findOne({_id});
};