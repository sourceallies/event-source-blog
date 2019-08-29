# Implementation

## Shipment Handler
    A Hapi handler is created for each type of command that can be submitted:  Submit, Assign, Ship and Deliver. The handler cannot atomically validate, persist and broadcast the command for other consumers, so the handler simply validates the structure of the command and publishes it to a queue. This way we can give a successful response to the client and fully process the command later, relying on the recoverability of the queue to ensure messages are processed safely and in order. Partitioning is needed to guarantee that two events for the same shipment are not being processed at the same time. We use the shipmentId as our partition key.
