
const shortid = require('shortid');
const fetch = require('node-fetch');
const Chance = require('chance');
const chance = new Chance();
const failFast = require('jasmine-fail-fast');
// eslint-disable-next-line no-undef
jasmine.getEnv().addReporter(failFast.init());

jest.setTimeout(50000);

describe('acceptance tests', () => {
    const shipmentId = shortid.generate();
    const accountId = `acc-${chance.character({alpha: true, casing: 'upper'})}`;
    const baseURL = 'http://localhost:3000';

    async function wait(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function getShipment() {
        const response = await fetch(`${baseURL}/shipments/${shipmentId}`);
        if (response.ok) {
            return await response.json();
        }
        const txt = await response.text();
        console.error(txt);
        throw new Error(`${response.statusCode}: ${txt}`);
    }

    describe('submit event', () => {
        let response;

        beforeAll(async () => {
            const submitEvent = {
                shipFrom: {
                    name: 'Source Allies',
                    line1: '4501 NW Urbandale Dr',
                    city: 'Urbandale',
                    state: 'IA',
                    zip: '50322'
                },
                shipTo: {
                    name: 'Iowa State Capital',
                    line1: '1007 Grand Ave',
                    city: 'Des Moines',
                    state: 'IA',
                    zip: '50309'
                },
                billToAccountId: accountId,
                weightInPounds: chance.natural({min: 5, max: 50})
            };
            response = await fetch(`${baseURL}/shipments/${shipmentId}/events/submit`, {
                method: 'POST',
                body: JSON.stringify(submitEvent)
            });
        });

        it('should return an ok response', () => {
            expect(response.status).toEqual(202);
        });

        it('should show the shipment in "Submitted" status', async () => {
            await wait(1000);
            const shipment = await getShipment();
            expect(shipment.status).toEqual('Submitted');
        });
    });

    it('should not let us attempt to ship before it is assigned', async () => {
        const response = await fetch(`${baseURL}/shipments/${shipmentId}/events/ship`, {
            method: 'POST',
            body: JSON.stringify({})
        });

        expect(response.status).toEqual(409);
    });

    describe('listing endpoint', () => {
        let response;
        let responseBody;

        beforeAll(async () => {
            response = await fetch(`${baseURL}/shipments`);
            responseBody = response.ok && await response.json();
        });

        it('should return an ok response', () => {
            expect(response.status).toEqual(200);
        });

        it('should return an array with at least one item', async () => {
            expect(responseBody.length).toBeGreaterThan(0);
        });
    });

    describe('assign shipment', () => {
        let response;

        beforeAll(async () => {
            const assignEvent = {
                truckId: 't1'
            };
            response = await fetch(`${baseURL}/shipments/${shipmentId}/events/assign`, {
                method: 'POST',
                body: JSON.stringify(assignEvent)
            });
        });

        it('should return an ok response', () => {
            expect(response.status).toEqual(202);
        });

        it('should show the shipment in "Assigned" status', async () => {
            await wait(1000);
            const shipment = await getShipment();
            expect(shipment.status).toEqual('Assigned');
        });
    });

    describe('ship event', () => {
        let response;

        beforeAll(async () => {
            const shipEvent = {
            };
            response = await fetch(`${baseURL}/shipments/${shipmentId}/events/ship`, {
                method: 'POST',
                body: JSON.stringify(shipEvent)
            });
        });

        it('should return an ok response', () => {
            expect(response.status).toEqual(202);
        });

        it('should show the shipment in "Shipped" status', async () => {
            await wait(1000);
            const shipment = await getShipment();
            expect(shipment.status).toEqual('Shipped');
        });
    });

    describe('deliver event', () => {
        let response;

        beforeAll(async () => {
            const deliveredEvent = {
            };
            response = await fetch(`${baseURL}/shipments/${shipmentId}/events/deliver`, {
                method: 'POST',
                body: JSON.stringify(deliveredEvent)
            });
        });

        it('should return an ok response', () => {
            expect(response.status).toEqual(202);
        });

        it('should show the shipment in "Delivered" status', async () => {
            await wait(1000);
            const shipment = await getShipment();
            expect(shipment.status).toEqual('Delivered');
        });
    });

    describe('invoice the billTo account', () => {
        let response;
        let accountEvents;

        beforeAll(async () => {
            await wait(1000);
            response = await fetch(`${baseURL}/accounts/${accountId}/events`);
            accountEvents = response.ok && await response.json();
        });

        it('should return a non-empty array', () => {
            expect(accountEvents.length).toBeGreaterThan(0);
        });

        it('should have an event for this shipment', () => {
            expect(accountEvents).toContainEqual(expect.objectContaining({
                shipmentId
            }));
        });
    });
});