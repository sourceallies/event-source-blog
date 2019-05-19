
# Event Source Blog Sample Application

This is the repository for an example application that demonstrates the topics covered in the event sourcing blog post.

## Getting Started

1. Run `docker-compose -f data-layer.compose.yml up` to start two docker containers. One for MongoDB and one for Kafka.
2. Run `npm start` to start the local server.
3. Run `npm run acceptance` to run a suite of acceptance tests against the local server.