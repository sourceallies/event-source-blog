
const Boom = require('boom');

module.exports = class IllegalShipmentStateError extends Error {
    constructor(message) {
        super(message);
        Boom.boomify(this, {statusCode: 409});
    }
};