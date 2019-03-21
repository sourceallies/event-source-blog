
# Business Process ##

Our shiping company wants to launch with the following customer experiance:

1. A customer that wants to ship something contacts the company and provides a pickup address, destination, and weight for a standard shipping pallet of goods.
1. The shipment cost is calculated based on distance and weight.
1. Dispatch assigns the shipment to a truck
1. The truck goes to the pickup address, loads the cargo and marks the shipment as shipped
1. The truck delivers the pallet to the destination and marks the cargo as delivered.
1. The Customer's account is debited
1. When customers settle their accounts (generaly via a mailed in check) then the account is credited accordingly.

### Notes:
- We need to be able to create shipments on a customers behalf. We would also like to allow customers to submit shipments via our website
- We want to send an email to a customer when their shipment has been assigned a truck, when it has been picked up, and when it has been delivered
- We also want to allow customers to view their balances.
- It is important for insurance reasons that we know exactly when we picked up a shipment and when we delivered a shipment and who signed for it when we picked it up and when we delivered it.
- Accounting wants to make sure that we can track outstanding balances.
- Accounting needs to know what day payments are made for tax purposes.
