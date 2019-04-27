const Joi = require('joi');

module.exports = Joi.object({
    truckId: Joi.string()
})
    .options({
        abortEarly: false,
        presence: 'required'
    });