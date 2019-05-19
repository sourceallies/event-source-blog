
const shortid = require('shortid');
const fetch = require('node-fetch');
const failFast = require('jasmine-fail-fast');
// eslint-disable-next-line no-undef
jasmine.getEnv().addReporter(failFast.init());

describe('acceptance tests', () => {
    const shipmentId = shortid.generate();
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

    describe('create event', () => {
        let response;

        beforeAll(async () => {
            const createEvent = {
                shipFrom: {
                    name: 'Bill',
                    line1: '123 Main st',
                    city: 'Anywhere',
                    state: 'IA',
                    zip: '50123'
                },
                shipTo: {
                    name: 'Acme Corp',
                    line1: '455 Mulburry st',
                    city: 'Anywhere',
                    state: 'IA',
                    zip: '50123'
                },
                weightInPounds: 10
            };
            response = await fetch(`${baseURL}/shipments/${shipmentId}/events/create`, {
                method: 'POST',
                body: JSON.stringify(createEvent)
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
        const response = await fetch(`${baseURL}/shipments/${shipmentId}/events/shipped`, {
            method: 'POST',
            body: JSON.stringify({})
        });

        expect(response.status).toEqual(409);
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
            response = await fetch(`${baseURL}/shipments/${shipmentId}/events/shipped`, {
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
});