
# Event Store

One of the key features of using an event sourced strategy for data storage is the ease by which history can be reconstructed.
This could e done by scanning through the queue and filtering out the events for a given shipment, but this wouldn't be pratical.
Instead, we want to store each event into some sort of database.
For our example application we are using MongoDB because it is a noSQL database that is easy to run locally.

Almost any database can be used for the storage of events.
Because the different types of events have different structures, a "no SQL" database is preferable so that all the events can be stored together and queried based on a shared shipmentId.
If using a relational database, it is convinient to have a single table that holds all the common fields for all the events and either nullable columns for the event specific fields or child tables.
These are sometimes called ["table per class hierarchy](https://docs.jboss.org/hibernate/core/3.3/reference/en-US/html/inheritance.html#inheritance-tableperclass) and ["table per subclass"](https://docs.jboss.org/hibernate/core/3.3/reference/en-US/html/inheritance.html#inheritance-tablepersubclass) respectively.

The implementation of the [event storage listener] is pretty streightforward:
First we create a listener on our queue that will receive every event message our handlers are broadcasting.
When we get an event, we can simply persist it using a deterministic primary key.
Most queueing systems (Kafka included) ensure only "at least once" delivery of a message.
If an exception is thrown after processing the message (ex. a network failure) then we will receive the message again.
For this reason, it is important that the persistance logic handle duplicates.
In the case of a no-sql store, the event can simply be plowed over with the duplicates.

Now that all our events are stored into a queryable database, we can write an [HTTP handler] to look up events by shipmentId.
