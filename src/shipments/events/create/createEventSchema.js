const Joi = require('joi');

module.exports = Joi.object({
    shipFrom: Joi.object({
        name: Joi.string(),
        line1: Joi.string(),
        line2: Joi.string().optional(),
        city: Joi.string(),
        state: Joi.string().length(2),
        zip: Joi.string().length(5)
    }),
    shipTo: Joi.object({
        name: Joi.string(),
        line1: Joi.string(),
        line2: Joi.string().optional(),
        city: Joi.string(),
        state: Joi.string().length(2),
        zip: Joi.string().length(5)
    }),
    weightInPounds: Joi.number()
        .min(1)
}).options({
    abortEarly: false,
    presence: 'required'
});