const Joi = require('joi');

module.exports = Joi.object({
    amount: Joi.number()
        .min(1)
}).options({
    presence: 'required',
    abortEarly: false
});