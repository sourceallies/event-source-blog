
const shortid = require('shortid');
const fetch = require('node-fetch');
const failFast = require('jasmine-fail-fast');
const publishShipmentCommand = require('./shipments/commands/publish');
const Chance = require('chance');
const chance = new Chance();
// eslint-disable-next-line no-undef
jasmine.getEnv().addReporter(failFast.init());

jest.setTimeout(50000);

describe('acceptance tests', () => {
    const shipmentId = shortid.generate();
    console.log('using shipmentId: ', shipmentId);
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
        throw new Error(`${response.status}: ${txt}`);
    }

    describe('submit', () => {
        let response;

        beforeAll(async () => {
            const submitCommand = {
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
            response = await fetch(`${baseURL}/shipments/${shipmentId}/commands/submit`, {
                method: 'POST',
                body: JSON.stringify(submitCommand)
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
        const response = await fetch(`${baseURL}/shipments/${shipmentId}/commands/ship`, {
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
            const assignCommand = {
                truckId: 't1'
            };
            response = await fetch(`${baseURL}/shipments/${shipmentId}/commands/assign`, {
                method: 'POST',
                body: JSON.stringify(assignCommand)
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

    describe('ship', () => {
        let response;

        beforeAll(async () => {
            const shipCommand = {
            };
            response = await fetch(`${baseURL}/shipments/${shipmentId}/commands/ship`, {
                method: 'POST',
                body: JSON.stringify(shipCommand)
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

    describe('deliver', () => {
        let response;

        beforeAll(async () => {
            const deliveredCommand = {
            };
            response = await fetch(`${baseURL}/shipments/${shipmentId}/commands/deliver`, {
                method: 'POST',
                body: JSON.stringify(deliveredCommand)
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

    describe('Duplicate delivery is received', () => {
        let accountBeforePublish;

        beforeAll(async () => {
            const response = await fetch(`${baseURL}/accounts/${accountId}`);
            if (!response.ok) {
                throw new Error(`${response.status}: ${await response.text()}`);
            }
            accountBeforePublish = await response.json();

            await publishShipmentCommand({
                shipmentId,
                type: 'deliver'
            });
        });

        describe('deduplicate shipment events', () => {
            let shipmentEvents;

            beforeAll(async () => {
                await wait(1000);
                const response = await fetch(`${baseURL}/shipments/${shipmentId}/events`);
                shipmentEvents = response.ok && await response.json();
            });

            it('should have 1 deliver events', () => {
                const deliverEvents = shipmentEvents
                    .filter((event) => event.type === 'deliver');
                expect(deliverEvents).toHaveLength(1);
            });
        });

        describe('should not double charge the account', () => {
            let account;

            beforeAll(async () => {
                const response = await fetch(`${baseURL}/accounts/${accountId}`);
                account = response.ok && await response.json();
            });

            it('should have the same balance as before', () => {
                expect(account.balance).toEqual(accountBeforePublish.balance);
            });
        });
    });
});