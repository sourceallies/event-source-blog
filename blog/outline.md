

# Intro (What is it?)

1. business explanation (Hypothetical business case)
2. the problem + typical mindset
3. a different way of thinking about the problem wrap up intro with a change of thought: "rather than storing state, if we stored activities, then...x, y, z"

# Body (How was it implemented?)

1. Description of terms
    - Event Sourcing
    - CQRS
2. High-level architecture overview
    1. emphasize that this approach uses off-the-shelf components (**not** specialized tools)
3. Start diving into the implementation
    1. Shipment handler (Done)
        - data coming in can be "bad" (repeat requests, invalid data per schema, etc.)
        - cannot both save data and broadcast events because of durability (atomic operation)
        - talk about queue implementation (need for partitioning and key)
    2. Shipment reducer (Ben P)
        - single-threaded in order to enforce data consistency + order of shipment events
        - Produces events as output + updates event store (data store? db? which term do we want to use?)
        - Safe to mutate multiple things because failure will cause the message to be reprocessed.
        - Discuss the need for an aggregate (can't rollup on the fly, need to search, need to ensure valid transitions)
    3. Cross-domain listener (Shipment -> Accounting) (Aabristi)
        - In a normal organization, handling shipment logistics and accounting/billing would be done by different teams
        - This could go on the shipment side or the accounting side
            - On the shipment side it makes logistics dependent on accounting. Shipments "push" a command to the accounting system
            - On the accounting side it make accounting depend on logistics. Accounting listens to shipments and reacts as an interested party
    4. Accounting handler (Paul R)
        - validates command against schema
        - sends a command into the accounting-command topic
    5. Accounting command listener
        - stores transactions
        - single-threaded to make sure that duplicate transactions are not created
    6. Account reducer
        - updates a snapshot of the account with a balance as transaction events are received
        - single threaded to make sure that transactions are not double counted or missed
    7. List shipment handler
        - Illuistrate the need to have aggregate roots

# Conclusion (What is the message?)
1. Not the solution to all problems
    1. What is it good for / pros (Paul R)
        1. isolating different parts of a business process
        2. isolating different parts of the system
        3. Can use familiar technologies and libraries
        3. easier to change business rules over time
        4. support rich auditing/analytics (keeping all events)
        5. handling heavy regulitory/compliance requirements (approvals, SLAs etc)
    2. What is it bad for / cons (Paul R)
        2. More complicated to reason about
        3. Not all changes are instance (eventual consistency). Time constrained my not be a good fit
        4. "edit" based workflows where a user can arbitrarly update many fields at his/her discression (bad for updating a profile maybe)
2. Not better or worse, just another tool in your toolbox. Something to consider when working on your next project.
