
const Joi = require('joi');
const IllegalShipmentStateError = require('../IllegalShipmentStateError');

const validShipmentSchema = Joi.object({
    status: Joi.string().valid('Shipped')
})
    .required()
    .options({
        allowUnknown: true
    });

function validateShipment(shipment) {
    const {error} = validShipmentSchema.validate(shipment);
    if (error) {
        throw new IllegalShipmentStateError(error.message);
    }
}

module.exports = function deliverCommandReducer(shipment, command) {
    validateShipment(shipment);

    return {
        ...shipment,
        status: 'Delivered',
        lastCommandTimestamp: command.timestamp
    };
};