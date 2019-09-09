# Implementation

## Shipment Handler

A Hapi handler is created for each type of command that can be submitted:  Submit, Assign, Ship and Deliver. The handler cannot atomically validate, persist and broadcast the command for other consumers, so the handler simply validates the structure of the command and publishes it to a queue. This way we can give a successful response to the client and fully process the command later, relying on the recoverability of the queue to ensure messages are processed safely and in order. Partitioning is needed to guarantee that two events for the same shipment are not being processed at the same time. We use the shipmentId as our partition key.

## Shipment Reducer

The shipment reducer listens for commands published to the command queue. Like all reducers in the system, it performs two primary tasks:

1. Make the state changes prescribed by each command received on the command queue
2. Publish an event upon successfully processing a command

The shipment reducer publishes events to the shipment event queue after successfully processing a shipment command. Other components of the system can subscribe to the shipment event queue to perform other tasks, such as account processing. For example, a "Deliver" command requests that a shipment be moved from the shipped state to the delivered state. The shipment reducer performs the necessary work and publishes a "Delivered" event. The account prcessing system can then use this event to debit an account.

The shipment reducer saves the shipment events and the state of each shipment to the data store. Although the current state of a shipment can always be rehydrated by reprocessing all previous events, the shipment reducer often needs to check that a command is valid for the current shipment state. Loading (caching) the current state is much faster than having to reprocess all previous events. Saving the current state of a shipment also improves the performance of external queries such as fetching the current state of a shipment.

When processing commands, the shipment reducer needs to ensure:

1. Commands are processed in-order.
2. Commands do not generate illegal states.

Commands have already been structurally validated by the shipment handler, so the above validation is more concerned with the semantics of a command. In-order processing is greatly simplified by the single-threaded execution of the handler. However, this alone does not guarantee commands are processed in-order. Extraneous circumstances such as network errors can cause command duplication or redelivery. Accordingly, the reducer saves the timestamp of the last command processed for a shipment and rejects any commands with an older timestamp.

The shipment reducer will reject any commands that would generate illegal state transitions. Knowing which commands to reject is part of the core business logic. For example, an "Assign" command cannot be applied on top of a shipment that's already in the "Shipped" state. If this were to occur, the shipment reducer would not update the shipment state or publish an event.

The core behavior of the shipment reducer can be found in these four lines within `processCommandListener.js`:

```js
const updatedShipment = reducer(loadedShipment, command);
await saveEvent(command);
await publishEvent(command);
await saveShipment(updatedShipment);
```

These statements are specifically ordered to ensure that the shipment reducer can recover from any critical errors.

- The `reducer` function updates the state of the shipment in memory. If the shipment reducer were to fail immediately after this statement, the system can recover by reloading the shipment state and reprocessing the current command. Since no events have been published, the downward components of the system are still in a consistent state.

- The `saveEvent` function saves the event to the data store. If the shipment reducer were to fail immediately after this statement, the system can recover by comparing the timestamp of the last event in the data store and the last published event. The shipment reducer can then publish any event that wasn't published successfully.

- The `publishEvent` function publishes the event to the event queue. Downward components of the system will receive the event after it's published. To recover from failure, the shipment reducer only needs to re-update the shipment state with the most recently published event.

- The `saveShipment` function saves the shipment state to the data store. At this point the command has been processed in its entirety.
