
module.exports = function shippedEventReducer(shipment, shipEvent) {
    return {
        ...shipment,
        status: 'Shipped',
        shipDate: shipEvent.eventTimestamp
    };
};