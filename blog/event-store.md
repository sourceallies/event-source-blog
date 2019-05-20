Rather than using these events to modify a "shipment" entity, we will instead persist the events verbatum.
This gives us the advantage of not loosing any data about an event.
It is also very simple, if the event passes validation then persist it.
If we need to know later when a shipment was assigned, or how many times it was assigned, or who assigned it, we can simply query up our event table for these records.
