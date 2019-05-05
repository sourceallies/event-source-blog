
const fetch = require('node-fetch');
const baseURL = 'http://localhost:3000';

async function createShipment(id) {
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
    const response = await fetch(`${baseURL}/shipments/${id}/events/create`, {
        method: 'POST',
        body: JSON.stringify(createEvent)
    });
    if (!response.ok) {
        throw new Error(`not ok: ${response.statusCode}: ${await response.text()}`);
    }
}

async function assignShipment(id) {
    const assignEvent = {
        truckId: 't1'
    };
    const response = await fetch(`${baseURL}/shipments/${id}/events/assign`, {
        method: 'POST',
        body: JSON.stringify(assignEvent)
    });
    if (!response.ok) {
        throw new Error(`not ok: ${response.statusCode}: ${await response.text()}`);
    }
}

async function shipShipment(id) {
    const shipEvent = {
    };
    const response = await fetch(`${baseURL}/shipments/${id}/events/shipped`, {
        method: 'POST',
        body: JSON.stringify(shipEvent)
    });
    if (!response.ok) {
        throw new Error(`not ok: ${response.statusCode}: ${await response.text()}`);
    }
}

async function createAll(id) {
    await createShipment(id);
    await assignShipment(id);
    await shipShipment(id);
}

createAll(process.argv[2])
    .then(() => console.log('done'))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });