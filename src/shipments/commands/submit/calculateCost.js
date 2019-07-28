
const COST_PER_POUND = 0.28;

module.exports = function calculateCost(submitShipmentCommand) {
    const {weightInPounds} = submitShipmentCommand;
    return weightInPounds * COST_PER_POUND;
};