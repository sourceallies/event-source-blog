const Joi = require('joi');

module.exports = Joi.object({
    shipFrom: Joi.object({
        name: Joi.string().required(),
        line1: Joi.string().required(),
        line2: Joi.string(),
        city: Joi.string().required(),
        state: Joi.string().length(2).required(),
        zip: Joi.string().length(5)
    }).required(),
    shipTo: Joi.object({
        name: Joi.string().required(),
        line1: Joi.string().required(),
        line2: Joi.string(),
        city: Joi.string().required(),
        state: Joi.string().length(2).required(),
        zip: Joi.string().length(5)
    }).required(),
    weightInPounds: Joi.number()
        .min(1)
});