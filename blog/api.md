
## API Design

State manipulation systems typically model business activities into one of three mutation functions following a REST paradiam.
Creating a new entity via a POST.
Updating an entity via PUT or PATCH.
And, deleting an entity via a DELETE.
This model of an API works very well when most combinations of edits are valid and few would be restricted by business constraints.
For our shipping company, submitting a shipment would be a POST.
Assigning it would be a PATCH.
Assigning it to a truck would be another PATCH.
Marking it shipped would also be a PATCH.
Marking it delivered would be a final PATCH.
This design causes three independent business actions map to the same PATCH request.
The code handling this request cannot simply modify the shipment and save it, as each modification needs to be validated against the current state of the shipment.

Rather than mapping business activities to only three mutation endpoints, we will instead map each activity to its own endpoint.
Each endpoint will be structured as a POST request that creates an "event".
These events represent the activity taking place:

- Submitting a shipment is a POST to `/shipments/{shipmentId}/events/submit`
- Assigning a shipment is a POST to `/shipments/{shipmentId}/events/assign`
- Marking it as shiped is a POST to `/shipments/{shipmentId}/events/ship`
- Delivering it is a POST to `/shipments/{shipmentId}/events/deliver`
- Viewing a single shipment is a GET to `/shipments/{shipmentId}`
- Viewing a list of shipments is a GET to `/shipments`

This strategy opens up several options to keep our application simple.
Because each activity is its own endpoint, the payload that is posted to that endpoint can be different.
This allows us to validate each model based on the constraints of that activity rather than a one-size-fits-all validation strategy on a domain entity.
For example, assigning a shipment requires a "truckId" property, but submitting a shipment does not.
Each endpoint is handled by its own controller.
This allows business logic to react to these events and augment them.
A business expert saying something like, "Whenever a shipment is *x*, then we should *y*", is a strong indicator of where that *y* action should go.
Security is simpler as well, we can secure each endpoint so only the users that are allowed to perform that function.
Because we know what the intent of the user is, we can broadcast to downstream systems the event the user is performing.
Rather than a message that says "this field was changed" we can have a message that says "this shipment was assigned".
The independence of endpoints handling the business events also allows for greater flexability.
If the business decides to insert a function in their process, we can simply add a new endpoint.
If the business decides that a step is no longer needed, we can simply remove the endpoint.
These kind of changes no longer require the mental gymnastics of figuring out what changes to make to a large spagetti of validation rules.

Exposing this kind of API is a key feature of a "Command Query Responsibility Segregation (CQRS)" style of design.
Simply implementing this one design pattern while still having request handlers load, mutate, and store the entity will provide benifits.
However, when looking back at the data, the intent of the user is lost as well as metadata about the action (i.e. who did an action or when it happened).
Unless that data is explicitly tracked.
Rather than modifying the state of the shipment, we can improve on this by having our storage reflect the improvements in our API design.


