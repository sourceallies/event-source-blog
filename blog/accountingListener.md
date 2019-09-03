## Accounting Command Listener

As with shipments, there is a listener responsible for processing all of the account commands. This listener is responsible for storing the accounting command as an accounting event (aka "transaction"). It is important that we do not double-charge or double-credit an account. We ensure this by having the publisher of a command assign a unique `_id` field to each accounting command. This listener then uses this field to de-duplicate commands to make sure that we do not process the same commad twice.
