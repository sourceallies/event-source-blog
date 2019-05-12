
## Introduction

Software development teams are responsible for building a wide variety of software to solve a wide variety of problems. Many of these software development projects start with a series of meetings and interviews with experts in the business domain to understand the problem and start to formulate solutions.

Suppose your team has been asked to work with *Great Plains Trucking* to help automate and streamline their operations. Managing shipments by hand via emails and spreadsheets is becoming too much. You meet with Amy, the chief operating officer:

> "Let me start with an overview of our business process.", Amy begins, "Typically a customer will call customer service with a shipment. We take down their information and give them the cost. The rep then sends an email to dispatch.

> Dispatch finds a truck that is available to pick up the shipment and adds the shipment to a shared spreadsheet of trucks to mark that truck as occupied. Dispatch calls the driver and lets them know the pickup address.

> The driver picks up the shipment and takes it to the destination address. Once the shipment has been delivered and the recipient has signed for it, the driver tells dispatch and dispatch marks the shipment as complete and the truck as available in the spreadsheet. Dispatch then sends an invoice over to finance with the customer account number and price.

> Finance has a spreadsheet for each customer where they track their shipments a well as payments recieved."

> A teammate asks, "What is the one biggest challenge with your process." Amy replies, "Each of these departments has built its own spreadsheet or email process to handle operations. We would like the departments to have better visability into what is going on with a shipment. If a customer calls us to ask why a shipment has not yet been picked up, Customer service has to call dispatch to figure out if they have sent a truck."

> "What kind of information is needed by customer service when a customer calls in?", asks another teammate. "Not a lot is needed to start the process.", replies Amy, "We need to know the customer account number, the pickup address, destination address and weight"

**TODO: continue narritive**

The above naritive outlines a popular project in software development. In this project, software is being used to replicate and codify a business process. Developers familiar with [Domain driven Design]() will quickly identify the business entity of *Shipment*. Each shipment would have several fields of data. Amy listed many of these fields: the customer, from address, destination, weight, truck as well as some sort of "status".

Generally, these kind of projects are implemented as a [CRUD] application that manages these business entities. Because this is going to be the system of record for shipments, the team decides to build a REST service to expose the data so that multiple applications can access it. A shipment table can be created in a database and a column added for each field. A get endpoint (/shipments) can be created to list all the shipments. A post endpoint (/shipments) can be built to create a shipment. And finally, a PATCH endpoint (/shipment/{shipmentId}) can be used to modify a shipment.

The above process is streightforward on the surface and many successful applications have been built with the above at its core. However, the design does not speak to the business process Amy laid out. It also does not address several other non-functional requirement that common sense and follow up interviews would suggest:

1. Events have to happen in a speicific order: Shipments cannot be delivered before they are shipped, etc.
2. Shipments can be reassigned to other trucks.
3. The customer account should not be debited until the shipment is delivered and not charged twice.
4. Some fields are required (e.x. truck) but not until a certain point in the process, before that they are unknown.
5. It is probably important to know when things happened in addition to current state. When a shipment was shipped vs delivered for example.
4. **TODO: more requirements**

Any one of the above can be implemented as a conditional check when a shipment is modified. However, these start to compound in complexity. Validation becomes complicated as some fields are only required in certain statuses, while others are required in other statuses. Deltas have to be calcuated to determine if a shipment is moving from one status to another to decide if a side effect needs to happen (i.e debiting an account). This forces the concerns of all the business processes together into a monolithic patch endpoint and validator. Over time, as requirements evolve and teams change, it will be come ever harder to understand and test the process.

In this blog we outline a different way of building applications that implement a business process called *event sourcing*. This design can greatly simplify the implementation of a business process as well as make it easier to modify and extend over time.