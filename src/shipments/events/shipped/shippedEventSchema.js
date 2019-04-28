
const Joi = require('joi');

module.exports = Joi.object({
}).options({
    abortEarly: false,
    presence: 'required'
});