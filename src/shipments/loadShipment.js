const mongoClient = require('../configuredMongoClient');

module.exports = async function loadShipment(_id) {
    return await mongoClient
        .db('shipment')
        .collection('shipments')
        .findOne({_id});
};