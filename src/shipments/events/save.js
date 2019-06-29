
const mongoClient = require('../../configuredMongoClient');

module.exports = async function saveEvent(event) {
    const _id = `${event.shipmentId}-${event.timestamp}`;
    await mongoClient
        .db('shipment')
        .collection('shipment_events')
        .replaceOne(
            {_id},
            {
                ...event,
                _id
            },
            {upsert: true}
        );
};