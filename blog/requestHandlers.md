
# Request Handlers

In our application, each business process gets its own descrete HTTP handler.
The main reason for this is simplicity.
Hapi, like most frameworks in other languages, allows the configration of validation and security rules on a per-url basis.
It also gives us a place to put logic that should be executed when an event is submitted.

We start by creating a Joi schema for a single business event.
This schema only has to be concerned with the data that could be provided as part of that event.
And, it can require any fields that must be provided.

We then create a Hapi handler under a RESTful URL that includes the entity id its path (i.e. /shipments/{shipmentId}/events/submit).
In this handler we wire in the schema and we can also specify the user role that is required to submit the event.
Within the handler method we add the shipmentId to the event that was submitted so that later on we know what shipment it is related to.
We also add a field called `eventType` and hard-code the value to "submit". This tells downstream code what type of event this is.
If this were a statically typed language then the specific type of the event object would hold this data and an explicit type field would be unnecessary.

All business rules about the validity of an event can be broken into two groups.
Structural rules represent the data that an event holds within itself.
Does it have the correct fields populated and are those fields populated with data of the right type in the right range.
There are also rules that relate to the state of the system outside this specific event.
One of these rules in our shipping company is pretty obvious: A shipment cannot be submitted if a shipment with that ID already exists.
Similar rules exist for the other event types.
They each require a shipment to be in a certain status before they can be submitted.
We will revisit how we handle these restrictions after we discuss reducers.

After validating the event to the best of our ability we need to persist it.
Typically data is saved to a database to ensure that it is safe.
However, in our system we have a broad need to react to events being submitted and most databases do not have a built in way to broadcast events to applications when records are saved (beyond a simple trigger).
We are actually going to send the event to a persistant topic (or queue).
For our system we are using Apache Kafka because it is simple and supports strict ordering within a partition.
ActiveMQ, RabbitMQ, IBM MQ Series, as well as AWS Kinesis, and others all support this feature.
In order to use this functionality a value is passed with each message that is submitted into the queue.
This value is hashed and used to determine what "partition" or "consumer group" the message is routed to.
The messaging server ensures that no two threads for a given logical client will be processing messages from the same partition at the same time.
If we use the shipmentId as our partition key then we can ensure that the consumers of our events never have a race condition between two events for the same subscription but we can still scale horizontally based on the number of subscriptions.

Publishing these events is something that every subscription event handler will need to do so we created a `publishEvent` module that takes an event and sends it to the "shipment-events" topic with a key set to the shipmentId within the event.

Now that the event is safely persisted to our topic we can return an HTTP response.
We chose to use a status code of 202 for our application to let the client know that we have "accepted" the event but have not necessarily processed it yet.