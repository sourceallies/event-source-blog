
## Accounting Payment Handler

Users will need a way to settle their accounts. To suport this we create a Hapi [payment handler]at the URL /accounts/{accountId}/commands/payment. Just as with shipments, this handler is responsible for validating the stucture of a payment and then sending the command to a queue (account-commands) to be processed by the command listener.