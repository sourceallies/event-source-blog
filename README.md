
# Event Source Blog Sample Application

This is the repository for an example application that demonstrates the topics covered in the [event sourcing blog post](https://www.sourceallies.com/2019/11/event-sourcing/).

## Getting Started

1. Run `docker-compose -f data-layer.compose.yml up` to start two docker containers. One for MongoDB and one for Kafka.
2. Run `npm start` to start the local server.
3. Run `npm run acceptance` to run a suite of acceptance tests against the local server.

This project was built using NodeJS 10.17.0. Other versions have not been tested. If you run into any issues, try using this version of NodeJS. An `.nvmrc` is included for convenience.