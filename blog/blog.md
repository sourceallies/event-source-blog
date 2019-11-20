# Introduction
 
Software development teams are responsible for building a wide variety of software to solve a wide variety of problems. Many of these software development projects start with a series of meetings and interviews with experts in the business domain to understand the problem and start to formulate solutions.
 
Suppose your team has been asked to work with _Great Plains Trucking_ to help automate and streamline their operations. Managing shipments via emails and spreadsheets is becoming too much. You meet with Amy, the chief operating officer.

> “Let me start with an overview of our business process,” Amy begins. “Typically, a customer will call Customer Service with a shipment. We take down their information and give them the cost. The representative then sends an email to Dispatch.”
 
> “Dispatch finds a truck that is available to pick up the shipment and adds the shipment to a shared spreadsheet of trucks to mark that truck as occupied. Dispatch calls the driver and lets them know the pickup address.”
 
> “The driver picks up the shipment and takes it to the destination address.”
 
> “Once the shipment has been delivered and the recipient has signed for it, the driver informs Dispatch that the shipment is complete. Dispatch marks the shipment as complete and the truck as available in the spreadsheet.”
 
> “Dispatch then sends an invoice over to Finance with the customer account number and price.”
 
> “Finance has a spreadsheet for each customer where they track their shipments as well as payments received.”
 
> A teammate asks, “What is the one biggest challenge with your process?” Amy replies, “Each of these departments has built its own spreadsheet or email process to handle operations. We want the departments to have better visibility into what is going on with a shipment. If a customer calls to ask why a shipment has not yet been picked up, Customer Service has to call Dispatch to figure out if they have sent a truck.”
 
> “What kind of information is needed by Customer Service when a customer calls in?” asks another teammate. “Not a lot is needed to start the process,” replies Amy. “We need to know the customer account number, the pickup address, destination address, and weight.”

This narrative outlines a common project in software development. In this project, the software is being used to replicate and codify a business process. 

# Traditional approach

Developers familiar with [Domain Driven Design](https://dddcommunity.org/learning-ddd/what_is_ddd/) (DDD) will quickly identify the business entity of _shipment_. Each shipment has several properties, as indicated by Amy:

- customer information
- starting address
- destination address
- weight
- delivery truck
- delivery status

Generally, these kinds of projects are implemented as CRUD (create, read, update, delete) applications that manage these business entities. A shipment table can be created in a database and a column added for each field. Several endpoints are created to manipulate the shipment.

- A POST endpoint can be built to create a shipment.
- A GET endpoint can be created to list all the shipments.
- A GET endpoint can be created to list a specific shipment. This will be used, for example, to check the current status of a shipment.
- And finally, a PATCH or PUT endpoint can be used to modify a shipment. For example, to assign a truck to a shipment.

The above design is straightforward on the surface, and many successful applications have been built with this approach. However, this design is vulnerable to expanding complexity once other business requirements are considered.

1. Events need to happen in a specific order. For example, shipments cannot be delivered before they are shipped.
2. Shipments can be reassigned to other trucks. For example, a vehicle malfunction may cause another truck to be dispatched.
3. Some shipment properties are only meaningful after reaching a certain point in the process. For example, the delivery truck is not known when the shipment is initially created and would be assigned later when preparing to ship.
4. From a data analytics and auditing perspective, it is important to know when things occur and what changes are made.

With the CRUD-based approach, these sorts of requirements are often implemented using **state mutation**: shipment activity is tracked by loading the current shipment from the database, mutating the properties, and then saving the shipment back into the database. This forces the concerns of all the business processes together into a monolithic PATCH endpoint. Over time, as requirements evolve and teams change, it will become even harder to understand and test the process. Furthermore, [optimistic concurrency control or pessimistic locking](https://docs.jboss.org/hibernate/orm/4.0/devguide/en-US/html/ch05.html) must be used to ensure that multiple mutations do not happen to the same entity at the same time.

# Event sourcing definition

In this blog, we outline a different way of building applications that implement a business process called **event sourcing**. This design can greatly simplify the implementation of a business process, as well as make it easier to modify and extend over time. This is a change in mindset from storing the _state_ of an entity to storing the _transitions_ an entity undergoes as business activities take place.

The term _event sourcing_ refers to this persistence strategy where individual events are stored as the primary system of record. The current state of an entity is sourced from those events by aggregating them into a whole instead of fetching a single record from a database.

# Reference implementation

Admittedly, the architecture of an event sourced system is more complicated than one based on state mutation. This complexity stems from the need to enforce a correct order of business events within a highly asynchronous system. Fortunately, event sourcing does not require any specialized software, servers, or frameworks. An event sourced system can be built as a familiar REST API with the same technologies with which the team is comfortable.
 
We have created a reference implementation of such a system and made it [available on GitHub](https://github.com/sourceallies/event-source-blog). The rest of this documentation will refer to the code in this implementation. While we have chosen libraries and frameworks that should be available to a wide developer audience, you may want to choose different tools depending on your deployment environment and the skillset of your team.

Our stack consists of the following major components:

- Any application server
    - We are using [NodeJS](https://nodejs.org/en/)

- A web framework
    - We are using [Hapi](https://hapi.dev/), but any framework that easily allows parsing and validating JSON payloads will work (Spring, ASP.NET, etc.).

- A data store
    - We are using [MongoDB](https://www.mongodb.com/), but any SQL or NoSQL database will work.

- A persistent queue
    - This is the one component that may not be present in traditional solutions. We are using [Kafka](https://kafka.apache.org/), but like the other components there are many options. The queueing system must support [partitioning of messages](https://activemq.apache.org/how-do-message-groups-compare-to-selectors) though. Utilizing this feature ensures that two messages that are part of the same "group" or "partition" will not be processed at the same time by different consumers, and also that messages will be processed in the order they were received. Essentially, they force that for a given key, processing is single-threaded. [ActiveMQ](https://activemq.apache.org/message-groups.html) and [Kinesis](https://docs.aws.amazon.com/streams/latest/dev/key-concepts.html#shard) are other options that support this feature.

The following image shows a high-level diagram of the components in the reference implementation.

<img src='dataFlowDiagram.svg' />

# Commands and queries

Similar to the traditional CRUD-based approach, a GET endpoint is created to fetch the current state of a shipment. However, instead of a POST to create the initial shipment entity followed by PATCH or PUT calls to update the shipment, we make event signaling a central part of the API by exposing a POST endpoint for each possible state transition or event that can occur.

In the case of our shipment application, this means a POST endpoint is created for the following events:

- When the customer first submits a shipment request
- When the shipment is assigned to a truck
- When the shipment is out for delivery
- When the shipment has been delivered
- When a payment is posted to an account

The request sent to each of these endpoints is called a command. Note that the shape of the commands can vary. This provides the benefit that each endpoint is only responsible for handling the data needed for its corresponding business event. For example, the POST endpoint to submit a shipment request would receive the shipment weight, which isn’t needed by the endpoint to signal that the shipment has been delivered. 

Also note that the shipment information returned by the GET endpoint will be different than the shape of the commands sent to the POST endpoints. This pattern of separating the commands from the data queries is referred to as [Command Query Response Segregation](https://martinfowler.com/bliki/CQRS.html) (CQRS). In our reference implementation, a Hapi handler is created for each of these shipment commands, as well as a handler to fetch the full list of shipments.

# Processing commands

As with the traditional approach, the API endpoint handlers serve as the entry point to the application. However, unlike the traditional approach, these handlers contain minimal business logic (either explicitly or implicitly via service calls). The handlers simply validate the structure of the commands, publish structurally valid commands to the command queue, then provide a successful response to the client to indicate that the message was received. Because these handlers do not execute all of the business rules, they cannot guarantee that a request will be successful. Therefore, clients cannot rely on the response codes in the same way they do with a REST endpoint. 

Deferring command processing is necessary because the handlers cannot atomically validate, persist, and evaluate commands. If two commands for the same shipment arrived at the same time, there would be state contention as both handlers would be attempting to transition the same entity through two different business processes at the same time.

Once a command is published to the queue, the command needs to be combined with the current shipment state to produce a new state. In functional programming, this operation is commonly considered a [reduction](https://en.wikipedia.org/wiki/Fold_(higher-order_function)). Accordingly, the component that implements this function in our example is called the shipment reducer.

After successfully processing a command, the shipment reducer will emit an event indicating the change that occurred. It’s important to distinguish commands from events:

- Commands are requests to make a change to the state of the system. Commands that originate externally are not guaranteed to be structurally or semantically valid. For example, the application could receive a command to assign a shipment that has already been delivered. 

- Events represent successful state changes. Commands that are processed successfully may generate one or more events, depending on the action requested by the command. Since events are generated internally, they should always be structurally valid.

For example, a "deliver" command requests that a shipment be moved from the shipped state to the delivered state. The shipment reducer verifies the shipment is in the correct state to perform the change, makes the update, then publishes a "delivered" event. 

While processing commands, the shipment reducer ensures:

1. Commands are processed in order.
2. Commands do not generate illegal states.

In-order processing is greatly simplified by the single-threaded execution of the handler. However, this alone does not guarantee commands are processed in order. Partitioning is needed to guarantee that two events for the same shipment are not being processed at the same time. We use the shipment ID as the partition key in our reference implementation. Extraneous circumstances (such as network errors) can also cause command duplication or redelivery. Accordingly, the reducer saves the timestamp of the last command processed for a shipment (called a “high water mark”). Any commands with an older timestamp are rejected.

The shipment reducer also rejects any commands that would generate illegal state transitions. Knowing which commands to reject is part of the core business logic. For example, an "Assign" command cannot be applied on top of a shipment that is already in the "Shipped" state. If this were to occur, the shipment reducer would not update the shipment state or publish an event. 

This type of race condition must be guarded against. But, because it is rare, we can add an optimization. We can preemptively execute the reducer code within the handler without saving the record. If the reducer fails, we can reject back to the client with a meaningful error message rather than enquing the command and waiting for the message to fail.

# Saving state changes

The shipment reducer saves the shipment events and the state of each shipment to the data store. Although the current state of a shipment can always be rehydrated by reprocessing all previous events, the shipment reducer often needs to check that a command is valid for the current shipment state. Loading (caching) the current state is much faster than having to reprocess all previous events. Saving the current state of a shipment also improves the performance of external queries such as fetching the current state of a shipment.

# Recovering from failures

The recoverability of the queue helps ensure commands are processed safely, but the shipment reducer still needs to process commands in the correct manner. The core behavior of the shipment reducer can be found in these four lines within `processCommandListener.js`:

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

- The `saveShipment` function saves the shipment state to the data store. At this point, the command has been processed in its entirety.

# Processing events

In a normal organization, the shipping logic and accounting rules are handled by different departments. Accordingly, these components should be decoupled in the application. Event sourcing systems achieve loose coupling by allowing systems to subscribe to the event stream of other systems. For example, the account processing system may listen for a “delivered” shipment event in order to debit an account. 

However, this design does present an organizational challenge: who is responsible for hooking up the event outputs from one domain to the command inputs of another domain? Following the above example:

- Is the business organized in a way that the shipping department tells the accounting department when to debit an account?

- Or is the business organized such that the accounting department is responsible for tracking deliveries so they know when to debit?

Regardless of the answer, it’s clear that there needs to be some cross-domain component that bridges two different domains in the application. In our reference implementation, the delivery invoice listener serves this role. It subscribes to the shipment event queue and generates a debit command any time it sees a “delivered” event.

# Conclusion

Now that we have covered all of the components that make up the _Great Plains Trucking_ system, we can talk about some of the benefits of this kind of architecture. The first and probably the greatest benefit of an event sourced system is isolation. It isolates different business processes from one another. A change to the rules for accepting a shipment does not affect the rules for delivering a shipment or paying an account. This isolation is also reflected in the code.

A traditional REST-based state mutation system would need to add more rules to the same handlers to determine who can save a record (depends on the state) and what makes a record valid (depends on where it is in the process). When making changes to a process in this setup, it is hard to reason about the effects the change has on other processes. In our system, each handler is responsible for validating the structure and security of one step in the process and is isolated and independent of the others.

While there are libraries and frameworks specific to event sourcing, they are not needed to implement this pattern. Our application uses well-tested and familiar frameworks and tools (NodeJS, Hapi, MongoDB). The only specific requirement is the ability to queue messages and process them synchronously within each entity. Because of this, event sourcing can be leveraged within existing teams and applications as appropriate.

Most applications will eventually require some level of auditing and history tracking. Oftentimes, this is bolted on later in the form of database triggers or audit tables that are written to as the application updates data. These solutions often cause the main system to become more complicated, as they are shoe-horned into an architecture that was not initially designed for them. They also suffer from lack of context: an audit table can track that a user changed a value from "27" to "20" on a particular date, but cannot track why that value changed (i.e. was a payment made, or a refund issued?). Event sourcing naturally tracks these events as the source of truth and leverages this data as an asset to the wider system rather than a burden. This feature is doubly important in systems that have regulatory requirements around auditing such as healthcare and financial systems.

We are not here to claim that event sourcing is the best architecture for every project. In fact, it is probably a poor choice the majority of the time. This architecture has more moving pieces than one based on state mutation. This leads to extra complexity if the application never adds enough business process to take advantage of it. A system that allows users to modify data without a prescribed process (e.g. modifying a customer profile) doesn't need event sourcing and there would typically only be one type of event "update X."

Another characteristic is that state is mutated _eventually_ and not directly. It is possible for clients to submit a command and then query the state of an entity and not see the command applied yet because it is still being processed. It is also possible for a command to be submitted successfully but then be rejected by the command handler because the state of the entity changed while the command was in flight. Clients would need the ability to check on the status of a command or be notified when a command is rejected. Mitigating these shortcomings can result in additional complexity for both the server and clients if visibility into these scenarios is needed.

In this blog we hope to give teams another architectural tool, along with an [example implementation](https://github.com/sourceallies/event-source-blog). When appropriate, it can help make some of the most complicated applications in the enterprise easier to maintain, change, and reason about.
