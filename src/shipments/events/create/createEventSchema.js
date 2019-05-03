const Joi = require('joi');

const address = Joi.object({
    name: Joi.string(),
    line1: Joi.string(),
    line2: Joi.string().optional(),
    city: Joi.string(),
    state: Joi.string().length(2),
    zip: Joi.string().length(5)
}).options({
    presence: 'required',
    abortEarly: false
});

module.exports = Joi.object({
    shipFrom: address,
    shipTo: address,
    weightInPounds: Joi.number()
        .min(1)
}).options({
    presence: 'required',
    abortEarly: false
});