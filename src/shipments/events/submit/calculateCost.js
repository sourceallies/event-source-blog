
const COST_PER_POUND = 0.28;

module.exports = function calculateCost(createShipmentEvent) {
    const {weightInPounds} = createShipmentEvent;
    return weightInPounds * COST_PER_POUND;
};